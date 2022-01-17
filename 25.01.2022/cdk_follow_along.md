# CDK step by step

## Opprett et C9 miljø
Gå til AWS konsollen og søk på `c9`. Opprett et nytt miljø med dine initialer som prefiks til miljø-navnet. La alle valgene stå som default og trykk `next step` og `create environment`. 

## Opprett CDK prosjekt
I ditt nye utviklingsmiljø, lag et unikt prefiks med dine initialer og lag en mappe til din CDK-app: 

```bash
PREFIX="dine initialer her"
mkdir ${PREFIX}-cdk
cd ${PREFIX}-cdk
```

Vi kan opprette strukturen til et nytt cdk-prosjekt med denne kommandoen:
```bash 
cdk init app "${PREFIX}-cdk-sertifiseringer" --language python
```

Denne kommandoen har også opprettet et virtuelt miljø som vi kan bruke for python-dependencies. Nå vil vi gjøre det klart til bruk. Med CDK versjon 2.x, alle stabile biblioteker følger med `aws-cdk`-pakken. Vi skal også ta i bruk noen "experimental" biblioteker. Disse kan få ødeleggende oppdateringer fremover, men fungerer for oss for nå. Vi kan legge dem til i `requirements.txt`-filen: 

```
echo "aws-cdk.aws-apigatewayv2-alpha==2.3.0a0" >> requirements.txt
echo "aws-cdk.aws-apigatewayv2-integrations-alpha==2.3.0a0" >> requirements.txt
```

Så kan vi aktivere og bruke det nye miljøet.

```
source .venv/bin/activate
pip install -r requirements.txt
```

Sjekk at alt er ok ved å skrive 

```bash 
cdk ls
```

Videre trenger vi å kopiere inn koden som skal brukes i lambda-funksjonene. La oss lage en egen mappe for dette, og kopiere inn innholdet fra de tilsvarende filene som ligger i git-mappen.

```bash
mkdir ${PREFIX}_cdk/functions
touch ${PREFIX}_cdk/functions/upload-lambda.js
touch ${PREFIX}_cdk/functions/sertifisering-lambda.js
```

## Kode med CDK

Nå som oppsettet er på plass, kan vi begynne å fylle inn `<prefix>_cdk/<prefix>_cdk_stack.py`-filen! En fullstendig fil kan kopieres fra git-mappen, men husk på å forandre på klassenavnet så det matcher stack-navnet ditt i `app.py`!

Først kan vi begynne med å importere det vi trenger: 

```python
from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    RemovalPolicy,
    aws_iam as iam,
    aws_lambda as _lambda,
    aws_apigatewayv2_alpha as api,
    aws_apigatewayv2_integrations_alpha as api_integrations
)
from constructs import Construct
```
Dersom dette gir problemer, se om du har klart å installere alle bibliotekene du trenger med `pip freeze`. Sjekk at du bruker det virtuelle miljøet!

Videre lager vi et unikt prefiks slik at du kan enkelt kjenne igjen dine ressurser i AWS-konsollen: 

```python
# Sett inn dine initialer her!
custom_prefix = "mine-initialer"
```

Nå kan vi begynne å opprette ressurser inne i `___init___()`-konstruktøren! La oss begynne med å lage en S3-bucket som skal hoste nettsiden.

```python 
        # S3 BUCKET
        bucket_name = f"{custom_prefix}-cdk-sertifiseringer-bucket"
        
        bucket = s3.Bucket(self, 
            bucket_name, 
            bucket_name = bucket_name,
            website_index_document = "index.html",
            removal_policy = RemovalPolicy.DESTROY,
            auto_delete_objects = True,
        )
        
        bucket.add_to_resource_policy(
            iam.PolicyStatement(
                actions = ["s3:*"],
                principals = [iam.AnyPrincipal()],
                resources = [bucket.bucket_arn + "/*"]
            )
        )
```

Vi trenger også et DynamoDB Table.

```python
        # DYNAMODB
        table_name = f"{custom_prefix}-cdk-sertifiseringer"
        
        database = dynamodb.Table(self, 
            table_name,
            table_name = table_name,
            partition_key = dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            removal_policy = RemovalPolicy.DESTROY,
        )
        
        database.auto_scale_read_capacity(
            min_capacity = 1,
            max_capacity = 5
        ).scale_on_utilization(target_utilization_percent=75)
        
        database.auto_scale_write_capacity(
            min_capacity = 1,
            max_capacity = 5
        ).scale_on_utilization(target_utilization_percent=75)
```

Her setter vi også autoskalering på tabellen. 

Vi trenger også to lambda-funksjoner. Her kan vi referere til javascript-funksjonene vi la inn i `functions`-mappen.

```python
        # LAMBDA
        upload_func = _lambda.Function(self, 
            f"{custom_prefix}-cdk-sertifisering-upload",
            function_name = f"{custom_prefix}-cdk-sertifisering-upload",
            code = _lambda.Code.from_asset(f"{custom_prefix}_cdk/functions"),
            handler = "upload-lambda.handler",
            runtime = _lambda.Runtime.NODEJS_14_X,
            environment = {
                "S3_BUCKET_NAME": bucket_name
            }
        )
        
        database_func = _lambda.Function(self, 
            f"{custom_prefix}-cdk-sertifisering-db",
            function_name = f"{custom_prefix}-cdk-sertifisering",
            code = _lambda.Code.from_asset(f"{custom_prefix}_cdk/functions"),
            handler = "sertifisering-lambda.handler",
            runtime = _lambda.Runtime.NODEJS_14_X,
            environment = {
                "TABLE_NAME": table_name
            }
        )
        
        database.grant_read_write_data(database_func)
```

Hittil har vi ikke laget noen IAM-ressurser. Ved mindre vi skal gjøre noe veldig spesifikt, trenger vi ikke det heller! De blir laget for oss, men vi kan likevel spesifisere nødvendige tilganger. La oss gi database-funksjonen lese og skrive-tilgang til DynamoDB tablet vårt:

```python 
database.grant_read_write_data(database_func)
```
Ingen knoting i IAM-konsollen nødvendig.

Til sist trenger vi en API gateway som nettsiden kan bruke til å interagere med backenden vår. Til dette bruker vi et HTTP API. Dette er per nå en eksperimentell del av CDK for python, og kan gjennomgå brytende forandringer i fremtiden.

```python
        # API
        http_api = api.HttpApi(self, 
            f"{custom_prefix}-cdk-sertifiseringer-api",
            api_name = f"{custom_prefix}-cdk-sertifiseringer-api",
            cors_preflight = api.CorsPreflightOptions(
                allow_headers = ["*"],
                allow_methods = [api.CorsHttpMethod.ANY],
                allow_origins = ["*"]
            )
        )
        
        http_api.add_routes(
            path = "/sertifiseringer",
            methods = [api.HttpMethod.GET, api.HttpMethod.PUT],
            integration = api_integrations.HttpLambdaIntegration("DatabaseIntegration", database_func)
        )
        
        http_api.add_routes(
            path = "/sertifiseringer/{id}",
            methods = [api.HttpMethod.GET, api.HttpMethod.DELETE],
            integration = api_integrations.HttpLambdaIntegration("DatabaseIntegrationPathVar", database_func)
        )
        
        http_api.add_routes(
            path = "/upload",
            methods = [api.HttpMethod.PUT],
            integration = api_integrations.HttpLambdaIntegration("UploadIntegration", upload_func)
        )
```

## Deployment 
Når alt er på plass, sjekk at alt fungerer ved å igjen skrive 

```bash 
cdk ls
```

Dersom man deployer en og en forandring, kan man se hvilke ressurser som er nye og hvilke som vil slettes med kommandoen
```bash 
cdk diff
```

Cloud Development Kit kompilerer python kode (i vårt tilfelle) til CloudFormation. Dersom du vil se den underliggende CloudFormation-koden kan du skrive
```bash 
cdk synth
```

Til slutt er det på tide å se om det fungerer! For å deploye applikasjonen din, skriv 
```bash 
cdk deploy
```

Dette kan ta en stund, men du burde få løpende oppdateringer på hva som opprettes og rives ned. Du kan også sjekke dette i AWS-konsollen ved å søke på `CloudFormation` og finne din stack.

## Testing
Dersom alt gikk bra, kan vi teste resultatet ved å prøve å gjenskape sertifisering-nettsiden. På din lokale maskin, naviger til git-repoet og opprett et shell i `s3/sertifisering-react-app`. Mappen. Vi trenger å gjøre om på en linje i `src/api.js`-filen, nemlig å sette `apiURL` til en den riktige verdien. Du finner API Gateway URLen ved å gå i AWS-konsollen, søke på `api gateway` og trykke på din gateway. Kopier linken under `Invoke URL` og lim inn i `api.js`-filen.

Når URLen er på plass kan vi kjøre 
```bash 
yarn install
```

og 
```bash 
yarn build
```

Finn din S3-bucket i AWS-konsollen (søk på `s3`), og last opp alle filene som finnes i `build`-mappen.

Til sist kan du gå under `Properties` på din S3 bucket, scrolle helt ned til bunnen og trykke på lenken under `Static website hosting` for å finne nettsiden!

## Cleanup
For å slette alle ressursene du har opprettet med CDK, kan du skrive følgende i C9-terminalen:

```bash 
cdk destroy
```

Når det er gjort kan du terminere EC2-instansen og C9-miljøet ved å gå til AWS-konsollen, søke på `C9`, velge ditt miljø og trykke på `Delete`.