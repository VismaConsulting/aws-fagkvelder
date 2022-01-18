# make s3 bucket to deploy to
aws s3 mb s3://eira-sam-deployment

# package code
aws cloudformation package --s3-bucket eira-sam-deployment --template-file template-sertifiseringer.yaml --output-template-file gen/template-sertifiseringer-generated.yaml

# deploy
aws cloudformation deploy --template-file gen/template-sertifiseringer-generated.yaml --stack-name eira-sam-stack --capabilities CAPABILITY_IAM