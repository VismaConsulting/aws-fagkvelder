# CloudFormation step-by-step guide

## Endre navn i CloudFormation template
Klon repoet på GitHub. All koden vi skal bruke ligger i mappen CloudFormation.

Åpne `cloudformation-template-sertifiseringer.yml` og legg inn ditt eget navn eller initialer under Prefix-parameteren (bytt ut `dine-initialer-eller-navn`). Denne parameteren brukes når AWS resources opprettes slik at de får et unikt navn inne på vår AWS-konto. I tillegg må **samme prefix** legges inn i `Table_NAME` og `S3_BUCKET_NAME` i inline-koden for de to Lambda-funksjonene. Det er henholdsvis én linje i hver funksjon som skal endres og denne linjen er kodelinje nr 3 i begge funksjonene.

Koden i `cloudformation-template-sertifiseringer.yml` er selve CloudFormation-templaten som AWS-ressursene skal genereres fra. Under `Resources` ligger alle ressursene som skal opprettes. Disse er

- Lambda-funksjon for å laste opp data til DynamoDB-tabell
- Lambda-funksjon for å laste opp bilde til S3 bucket
- API Gateway for å trigge lambda-funksjonene
- S3 bucket for hosting av static website
- Bucket policy for nevnte S3 bucket
- DynamoDB-tabell
- To IAM-roller som Lambda-funksjonene skal bruke
- Lambda-permissions som tillater API-et å invoke Lambda-funksjonene
- Integrasjon mellom API og Lambda-funksjoner
- API-deployment
- Stage for å deploye API-et til

## Laste opp template og opprette stack
Åpne AWS Management Console og naviger inn til CloudFormation. Trykk på *Create stack* og deretter *With new resources (standard)*. Velg *Upload a template file* og last opp `cloudformation-template-sertifiseringer.yml`. Trykk *Next* og gi stacken din et navn. Gjerne bruk initialene dine først i stacknavnet. Trykk *Next*, *Next* og huk deretter av på *I acknowledge that AWS CloudFormation might create IAM resources*. Klikk så på *Create stack*. Du vil nå se AWS-ressursene dine bli opprettet under *Events* inne på stacken din. Når status viser CREATE_COMPLETE på selve stacken er den ferdig. 

## Laste opp React-kode
Når status på stacken viser CREATION_COMPLETE, kan vi åpne API Gateway i AWS Management Console og finne API-et som ble laget. Kopier URL-en og legg dette til i filen `api.js`. Kjør deretter
```bash 
npm install
npm run build
```
fra terminalen i React-prosjektet. Dette oppretter en build-mappe. Naviger til S3 i AWS Management Console og finn din `PREFIX-cloudformation-sertifiseringer-bucket`. Åpne denne og velg *Upload*. Last opp innholdet i build-mappen. Deretter kan du gå til `Properties` i din S3 bucket og scrolle helt nederst. Klikk på lenken under `Static website hosting`. Nå har du opprettet din helt egne sertifiseringer-nettside ved hjelp av CloudFormation.

## Cleanup
Når du vil slette stacken din og alle ressursene den opprettet må du først navigere inn i S3 og slette alle filene i din `PREFIX-cloudformation-sertifiseringer-bucket`. Deretter kan du gå til CloudFormation og velge din stack og trykke på din `Delete`.