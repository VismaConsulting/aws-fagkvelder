const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const S3_BUCKET_NAME = "eira-sam-sertifiseringer-bucket"; // må endre bucket name

exports.handler = async (event) => {
  let contentTypes = ["jpg", "png", "jpeg"];
  let fileContent = event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : event.body;
  let fileName = event.headers["filename"];
  let contentType =
    event.headers["content-type"] || event.headers["Content-Type"];
  let extension = contentType ? contentType.split("/")[1] : "";
  if (contentTypes.includes(extension.toLowerCase())) {
    const S3_KEY = "assets/" + fileName;

    try {
      let data = await s3
        .putObject({
          Bucket: S3_BUCKET_NAME,
          Key: S3_KEY,
          Body: fileContent,
          ContentType: contentType,
          //ACL: "public-read",
        })
        .promise();
      const body = {
        bucketName: S3_BUCKET_NAME,
        keyName: S3_KEY,
        objectUrl: getObjectUrl(S3_BUCKET_NAME, S3_KEY),
      };

      return {
        body: body,
        status: 200,
      };
    } catch (err) {
      throw err;
    }
  } else {
    return {
      body: "Wrong file type. Try again with JPG or PNG.",
      status: 400,
    };
  }
};

function getObjectUrl(bucketName, objectKey) {
  const objParams = {
    Bucket: bucketName,
    Key: objectKey,
  };
  const bucket = s3.getObject(objParams);

  const region = bucket.service.config.region;
  const regionString = region.includes("us-east-1") ? "" : "-" + region;
  const url = `https://${bucketName}.s3${regionString}.amazonaws.com/${objectKey}`;
  return url;
}
