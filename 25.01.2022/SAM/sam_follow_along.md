# SAM step by step

## Installere nødvendig programvare
Det første som må gjøres er å installere nødvendig programvare. Det er fordi vi skal opprette AWS-ressurser fra command line.
Det første som må installeres er AWS CLI ved å følge denne linken https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
Deretter må AWS SAM CLI installeres: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

## Kode
Klon repoet på GitHub. All koden vi skal bruke ligger i mappen SAM.

Åpne `template-sertifiseringer.yaml` og legg inn ditt eget navn eller initialer under Prefix-parameteren (bytt ut `dine-initialer-eller-navn`). Denne parameteren brukes når AWS resources opprettes slik at de får et unikt navn inne på vår AWS-konto. I tillegg må **samme prefix** legges inn i `Table_NAME` og `S3_BUCKET_NAME` i filene `src/lambda-to-dynamo-db/index.js` og `src/lambda-upload-to-s3/index.js`.

Koden i `template-sertifiseringer.yaml` er selve SAM-templaten som AWS-ressursene skal genereres fra. Linjen `Transform: 'AWS::Serverless-2016-10-31'` sier at det er en SAM-template og derfor må kompileres til CloudFormation. Under `Resources` ligger alle ressursene som skal opprettes. Disse er

- Lambda-funksjon for å laste opp data til DynamoDB-tabell
- Lambda-funksjon for å laste opp bilde til S3 bucket
- API Gateway for å trigge lambda-funksjonene
- S3 bucket for hosting av static website
- Bucket policy for nevnte S3 bucket
- DynamoDB-tabell

Selve koden som lambda-funksjonene skal kjøre ligger under mappen `src`. React-koden for S3-nettsiden ligger på GitHub under mappen `sertifisering-react-app`. Denne lastes ikke opp via SAM og terminalen, men legges manuelt inn i din S3 bucket senere.

## Package and deploy
Når du har endret på prefix og navn for S3 bucket og DynamoDB-tabell er vi klare til å deploye koden til AWS. Kommandoene som må kjøres i terminalen ligger i `commands.sh`. Her følger en beskrivelse av hva de forskjellige kommandoene gjør.

Det første vi skal gjøre er å opprette en S3 bucket der templaten vår og kildekoden til lambda-funksjonene skal lagres. Dette er ikke samme S3 bucket som vi skal opprette gjennom SAM. Det gjøres ved kommandoen under. Husk å bytte ut `PREFIX` med ditt eget navn eller initialer.
```bash 
aws s3 mb s3://PREFIX-sam-deployment
```

Deretter skal vi kjøre en package-kommando. Husk å benytt samme `PREFIX` her som ovenfor. Denne er 
```bash 
aws cloudformation package --s3-bucket PREFIX-sam-deployment --template-file template-sertifiseringer.yaml --output-template-file gen/template-sertifiseringer-generated.yaml
```

Til slutt skal koden deployes. Bytt ut `PREFIX` med egne initialer for stack-navnet.
```bash 
aws cloudformation deploy --template-file gen/template-sertifiseringer-generated.yaml --stack-name PREFIX-sam-stack --capabilities CAPABILITY_IAM
```

Du kan nå navigere til CloudFormation i AWS Management Console for å se at stacken din opprettes. 

## React-kode
Når status på stacken viser CREATION COMPLETE, kan vi åpne API Gateway og finne API-et som ble laget. Kopier URL-en og legg dette til i filen `api.js`. Kjør deretter
```bash 
npm install
npm run build
```
fra terminalen i React-prosjektet. Dette oppretter en build-mappe. Naviger til S3 i AWS Management Console og finn din `PREFIX-sam-sertifiseringer-bucket`. Åpne denne og velg *Upload*. Last opp innholdet i build-mappen. Deretter kan du gå til `Properties` i din S3 bucket og scrolle helt nederst. Klikk på lenken under `Static website hosting`. Nå har du opprettet din helt egne sertifiseringer-nettside ved hjelp av SAM.

## Cleanup
Når du vil slette stacken din og alle ressursene den opprettet må du først navigere inn i S3 og slette alle filene i din `PREFIX-sam-sertifiseringer-bucket`. Deretter kan du gå til CloudFormation og velge din stack og trykke på din `Delete`.