# make s3 bucket to deploy to
aws s3 mb s3://PREFIX-sam-deployment

# package code
aws cloudformation package --s3-bucket PREFIX-sam-deployment --template-file sam-template-sertifiseringer.yaml --output-template-file gen/template-sertifiseringer-generated.yaml

# deploy
aws cloudformation deploy --template-file gen/template-sertifiseringer-generated.yaml --stack-name PREFIX-sam-stack --capabilities CAPABILITY_IAM