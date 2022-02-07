# AWS Fagkvelder

Her lagrer vi alt kodesnutter som vi bruker i fagkveldene våre, med en forklaring av hva vi gjorde.

## \#1 Introduksjon til AWS og Hands-on EC2

[Kodesnutter](./08.09.2021)

Vi hadde en rask introduksjon av @mKenas til AWS hvor vi gikk gjennom hva sky er, hvordan det fungerer, og hvorfor man bruker det.

For den praktiske delen av denne fagkvelden hadde vi en hands-on gjennomgang av hvordan sette opp en EC2-server, i flere nivåer. Vi satt opp en enkel Apache webserver med litt info, samt testet ut templates til Scaling Groups og Load Balancing med stresstesting av servere.

## \#2 Serverless

[Kodesnutter](./19.10.2021)

I forrige fagkveld så vi på det å spinne opp en server. Nå skal vi ta et steg videre og skippe hele servern. Vi ser nærmere på serverless og lar AWS gjøre serverjobben for oss. Vi bygger en dynamisk nettside med S3 og viser litt data fra en database. Dataene kommer vi til å hente via disse serverless-funksjonene vi lager.

Stikkord: AWS, serverless, Lambda function, API Gateway, DynamoDB, S3

## \#3 CI/CD

[Kodesnutter](./11.11.2021)

Utviklerverktøy! Vi starter med litt hands-on med terminalen hvor vi tester noen forskjellige kommandoer og setter opp en EC2 server som vi skal bruke senere til deployment.

Videre ser vi på hvordan vi kan enkelt sette opp en CI/CD pipeline med CodeStar for å automatisere bygg og deploy av en Spring Boot-applikasjon før vi hopper over til å lage en pipeline fra bunnen av med CodePipeline, CodeBuild og CodeDeploy!

Stikkord: EC2, CI/CD, CodeStar, CodePipeline, CodeBuild, CodeDeploy

## \#4 AWS + Europris

Visma Digital Commerce utvikler netthandel og omnikanal for europris.no - og det man ser på nett er bare toppen av isfjellet av det vi utvikler sammen med Europris ASA.

Vi gjennomgår/gikk AWS i Europris.

Ingen kodesnutter denne gangen, bare en presentasjon.

## \#5 Migration

Ingen kodesnutter her, ingen hands-on.

Bli med på årets siste AWS-fagkveld! Denne gangen skal vi lære litt mer om det store fokuset vårt innen AWS om dagen; Migrering til AWS.

Aller først får alle en sniktitt på hvordan det går med NAV PoCen som vi fikk høre om før sommeren og på Voss. NAV PoCen er en migrering av en stormaskin-applikasjon.

Mohamad ta oss gjennom fordelene ved migrering, migreringsfasene og hvilke AWS tjenester som forenkler migreringsprosessen. Videre får vi se en demo over hvordan vi kan bruke AWS database migration service for å flytte en MySQL database til RDS ved hjelp av Database Migration Service og hvordan vi kan bruke AWS Application Migration Service til å flytte en hel nettside til skyen.

Stikkord: NAV PoC, MySQL, RDS, Database Migration Service, AWS Application Migration Service, database, migrering

## \#6 Infrastructure as Code (IaC)

[Kodesnutter](./25.01.2022)

Her ser vi på infrastuktur som kode og hvordan man kan slippe å trykke på knapper, og gjenskape infrastruktur på 1-2-3, og vi vil se på hvordan provisjonere skyressurser med Infrastructure as Code, og hvordan dette kan brukes i AWS med CloudFormation, Serverless Application Model og AWS sitt Cloud Development Kit. Det blir også hands-on hvor vi vil gjenskape en applikasjon fra en tidligere fagkveld ved bruk av disse verktøyene. Bli med og se hvordan du kan slippe å manuelt trykke på knapper!

Eira og Gaute tok oss gjennom hvordan sette opp den samme applikasjonen med infrastruktur som kode med CloudFormation, SAM og CDK.

**Kodesnutter med gjennomgang**\
[CDK](./25.01.2022/CDK)\
[CloudFormation](./25.01.2022/CloudFormation)\
[SAM](./25.01.2022/SAM)

Stikkord: CloudFormation, Serverless Application Model (SAM), Cloud Development Kit (CDK)
