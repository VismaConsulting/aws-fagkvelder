# CI/CD pipeline og utvikler verktøy

Her finner dere eksempel prosjekt, kodesnutter og AWS CLI komandoene for denne fagkvelden.

Hvis du vil bruke din egen terminal app må du laste ned AWS CLI på din maskin:

[Installere AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

Vi kan bruke `--dry-run` cli parameter for å teste om syntaksen er riktig men uten å opprette ressurser.

Vi kan starte med å lagre initialene i en variabel i terminalen

**Husk å ikke legge noe mellomrom mellom variabelnavnet, lik tegn og verdien**

```
initials=DINE_INITIALER
```

For å opprette en S3 bucket kan vi skrive følgene:

```
bucketName=$initials-utvikler-fagkveld
aws s3 mb s3://$bucketName
```

Ut:

```
make_bucket: DINE_INITIALER-utvikler-fagkveld
```

For å sette opp en EC2 server fra AWS CLI trenger vi å opprette flere ressuser:

Først trenger vi å lage et sikkerhetsnøkkelpar som brukes ved kobling til serveren

```
keyName=$initials-utvikler-key
aws ec2 create-key-pair --key-name $keyName --query "KeyMaterial" \
--output text > $keyName.pem

ls
```

Ut:

```
DINE_INITIALER-utvikler-key.pem
```

For å kunne koble til server senere trenger vi å begrense hvem kan bruke nøkklen

```
chmod 400 $keyName.pem
```

Vi lager sikkerhetsgruppe for å difinere hvilken porter skal åpnes fra serveren

```
groupName=$initials-utvikler-sg
aws ec2 create-security-group --group-name $groupName \
--description "Tillate ssh og tcp 8080"
```

Ut:

```
{
    "GroupId": "sg-020c2570f369ee6df"
}
```

Vi lagrer iden til sikkerhetsgruppen i en variabel

```
securityGroupID=ID_FRA_OUTPUT
```

Vi åpner opp ssh og 8080 porter med disse komandoene:

```
aws ec2 authorize-security-group-ingress --group-id $securityGroupID \
--protocol tcp --port 22 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress --group-id $securityGroupID \
--protocol tcp --port 8080 --cidr 0.0.0.0/0
```

Vi bruker `run-instances` for å sette opp ny server

```
aws ec2 run-instances --image-id ami-01cc34ab2709337aa \
--count 1 --instance-type t2.micro --key-name $keyName \
--security-group-ids $securityGroupID
```

Ut:

```
{
  "Groups": [],
  "Instances": [
    {
      "AmiLaunchIndex": 0,
      "ImageId": "ami-01cc34ab2709337aa",
      "InstanceId": "i-04d8df24d3c966cb4",
      "InstanceType": "t2.micro",
      "KeyName": "DINE_INITIALER-utvikler-key",
      "SecurityGroups": [
        {
          "GroupName": "DINE_INITIALER-utvikler-sg",
          "GroupId": "sg-020c2570f369ee6df"
        }
      ]
    }
  ]
}
```

Vi lagrer iden til servern i en variabel:

```
instanceID=i-04d8df24d3c966cb4
```

Vi legger til en tag så kan vi finne serveren senera når vi skal deploye

```
instanceName=$initials-SpringApp
aws ec2 create-tags \
 --resources $instanceID --tags Key=Name,Value=$instanceName
```

For gi serveren tilganger til S3 må vi lage følgene:

- Instance profile som er kontainer for an IAM roller
- Rolle som brukes for å gi midlertidig tilgang AWS tjenster
- Policy difinere tilgagnene i JSON

```
instanceProfileName=$initials-utvikler-instance-profile
aws iam create-instance-profile --instance-profile-name $instanceProfileName
```

Vi lager en JSON fil som skal

```
cat <<EOT > trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOT
```

Vi lager en rolle

```
roleName=$initials-utvikler-role
aws iam create-role --role-name $roleName \
--assume-role-policy-document file://trust-policy.json
```

Ut:

```
{
  "Role": {
    "Path": "/",
    "RoleName": "DINE_INITIALER-utvikler-role",
    "RoleId": "AROA4FUM6DNHVYGH3CYZY",
    "Arn": "arn:aws:iam::836740455247:role/DINE_INITIALER-utvikler-role",
    "CreateDate": "2021-11-04T22:53:52+00:00",
    "AssumeRolePolicyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ec2.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }
  }
}

```

Vi legger til pre-definert policy

```
aws iam attach-role-policy \
--policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess \
--role-name $roleName
```

```
aws iam add-role-to-instance-profile \
--instance-profile-name $instanceProfileName \
--role-name $roleName
```

```
aws ec2 associate-iam-instance-profile \
--instance-id $instanceID \
--iam-instance-profile Name=$instanceProfileName
```

Ut:

```
{
  "IamInstanceProfileAssociation": {
    "AssociationId": "iip-assoc-09564eba2dca820e6",
    "InstanceId": "i-04d8df24d3c966cb4",
    "IamInstanceProfile": {
      "Arn": "arn:aws:iam::836740455247:instance-profile/DINE_INITIALER-utvikler-instance-profile",
      "Id": "AIPA4FUM6DNHU3LPPSRBR"
    },
    "State": "associating"
  }
}
```

```
aws ec2 describe-instances --instance-ids $instanceID
```

Ut:

```
{
  "Reservations": [
    {
      "Groups": [],
      "Instances": [
        {
          "AmiLaunchIndex": 0,
          "ImageId": "ami-01cc34ab2709337aa",
          "InstanceId": "i-04d8df24d3c966cb4",
          "InstanceType": "t2.micro",
          "KeyName": "DINE_INITIALER-utvikler-key",
          "LaunchTime": "2021-11-04T22:14:02+00:00",
          "Monitoring": {
            "State": "disabled"
          },
          "Placement": {
            "AvailabilityZone": "us-east-1b",
            "GroupName": "",
            "Tenancy": "default"
          },
          "PrivateDnsName": "ip-172-31-93-157.ec2.internal",
          "PrivateIpAddress": "172.31.93.157",
          "ProductCodes": [],
          "PublicDnsName": "ec2-3-83-129-167.compute-1.amazonaws.com",
          "PublicIpAddress": "3.83.129.167",
          "State": {
            "Code": 16,
            "Name": "running"
          },
          "StateTransitionReason": "",
          "SubnetId": "subnet-68a98549",
          "VpcId": "vpc-53e5972e",
          "Architecture": "x86_64",
          "BlockDeviceMappings": [
            {
              "DeviceName": "/dev/xvda",
              "Ebs": {
                "AttachTime": "2021-11-04T22:14:03+00:00",
                "DeleteOnTermination": true,
                "Status": "attached",
                "VolumeId": "vol-0281f8ac0906a701b"
              }
            }
          ],
          "ClientToken": "ade6ae5c-1c0d-4118-8414-45daeea26a1c",
          "EbsOptimized": false,
          "EnaSupport": true,
          "Hypervisor": "xen",
          "IamInstanceProfile": {
            "Arn": "arn:aws:iam::836740455247:instance-profile/DINE_INITIALER-utvikler-instance-profile",
            "Id": "AIPA4FUM6DNHU3LPPSRBR"
          },
          "NetworkInterfaces": [
            {
              "Association": {
                "IpOwnerId": "amazon",
                "PublicDnsName": "ec2-3-83-129-167.compute-1.amazonaws.com",
                "PublicIp": "3.83.129.167"
              },
              "Attachment": {
                "AttachTime": "2021-11-04T22:14:02+00:00",
                "AttachmentId": "eni-attach-0f521e9a4025de1cd",
                "DeleteOnTermination": true,
                "DeviceIndex": 0,
                "Status": "attached",
                "NetworkCardIndex": 0
              },
              "Description": "",
              "Groups": [
                {
                  "GroupName": "DINE_INITIALER-utvikler-sg",
                  "GroupId": "sg-020c2570f369ee6df"
                }
              ],
              "Ipv6Addresses": [],
              "MacAddress": "12:98:4a:da:c0:d3",
              "NetworkInterfaceId": "eni-0e802fe32d99d1715",
              "OwnerId": "836740455247",
              "PrivateDnsName": "ip-172-31-93-157.ec2.internal",
              "PrivateIpAddress": "172.31.93.157",
              "PrivateIpAddresses": [
                {
                  "Association": {
                    "IpOwnerId": "amazon",
                    "PublicDnsName": "ec2-3-83-129-167.compute-1.amazonaws.com",
                    "PublicIp": "3.83.129.167"
                  },
                  "Primary": true,
                  "PrivateDnsName": "ip-172-31-93-157.ec2.internal",
                  "PrivateIpAddress": "172.31.93.157"
                }
              ],
              "SourceDestCheck": true,
              "Status": "in-use",
              "SubnetId": "subnet-68a98549",
              "VpcId": "vpc-53e5972e",
              "InterfaceType": "interface"
            }
          ],
          "RootDeviceName": "/dev/xvda",
          "RootDeviceType": "ebs",
          "SecurityGroups": [
            {
              "GroupName": "DINE_INITIALER-utvikler-sg",
              "GroupId": "sg-020c2570f369ee6df"
            }
          ],
          "SourceDestCheck": true,
          "Tags": [
            {
              "Key": "Name",
              "Value": "DINE_INITIALER-SpringApp"
            }
          ],
          "VirtualizationType": "hvm",
          "CpuOptions": {
            "CoreCount": 1,
            "ThreadsPerCore": 1
          },
          "CapacityReservationSpecification": {
            "CapacityReservationPreference": "open"
          },
          "HibernationOptions": {
            "Configured": false
          },
          "MetadataOptions": {
            "State": "applied",
            "HttpTokens": "optional",
            "HttpPutResponseHopLimit": 1,
            "HttpEndpoint": "enabled"
          },
          "EnclaveOptions": {
            "Enabled": false
          }
        }
      ],
      "OwnerId": "836740455247",
      "ReservationId": "r-0a9cc1eba603b9438"
    }
  ]
}

```

```
aws ec2 describe-instances --instance-ids $instanceID \
--query "Reservations[0].Instances[0].{PublicIp: PublicIpAddress,Name:Tags \
[?Key=='Name']|[0].Value,Status:State.Name}"
```

Ut:

```
{
"PublicIp": "3.83.129.167",
"Name": "DINE_INITIALER-SpringApp",
"Status": "running"
}
```

```
publicIp=3.83.129.167
```

For å lære mer om --query format sjekk [jmespath](https://jmespath.org/)

Koble tol serveren

```
ssh -i $keyName.pem ec2-user@$publicIp
```

Nå skal vi installere CodeDeploy agent

```
sudo yum update -y
sudo yum install ruby -y
sudo yum install wget -y
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
sudo service codedeploy-agent start
sudo service codedeploy-agent status
```

Hvis deployet feiler prøv en annen version av CodeDeploy agent

```
sudo service codedeploy-agent stop
sudo ./install auto -v releases/codedeploy-agent-1.1.0-4.noarch.rpm
sudo service codedeploy-agent start
```
