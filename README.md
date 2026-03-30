## SUBSNAP BACKEND – ARCHITECTURE & ENGINEERING OVERVIEW

- Author: **Nelvison Benedetto**
- Project: SubSnap Backend
- Platform: ASP.NET Core (.NET 8)
- Database: PostgreSQL
- ORM: Entity Framework Core
- Architecture: Clean Architecture + Domain-Driven Design + CQRS
- Style: Domain-First + Vertical Slice Architecture
- Messaging Pattern: MediatR (internal only)
- Maturity Level: Production-grade backend foundation

Piattforma online: https://substracker.live with 200+ users, sign-up now!<br>
SubSnap è progettato intenzionalmente seguendo pratiche architetturali adottate nei backend moderni ad alta scalabilità, ispirate a piattaforme utilizzate da aziende come Uber, Stripe, Shopify e da sistemi enterprise basati su ASP.NET Core.

L'obiettivo del progetto non è dimostrare semplicemente l'implementazione di funzionalità applicative, ma mostrare un approccio strutturale alla progettazione di backend scalabili, mantenibili ed evolvibili nel tempo.

SubSnap rappresenta quindi un blueprint architetturale orientato alla produzione, progettato per evidenziare pattern e principi utilizzati nei sistemi backend di larga scala.

```
         API
        /   \
Application  Infrastructure
       \    /
        Core[Domain]
```

---
### .CORE layer
Questo layer contiene **pure business logic** e il **core domain model**.
È completamente indipendente da framework, infrastruttura o servizi esterni e deve poter essere eseguito in isolamento.

**Contains**:
DOMAIN [Entities, Aggregates, Value Objects, Events, Domain Rules, ...].

**References**: NONE

---

### .APPLICATION layer
Questo layer definisce gli **application workflows** e rappresenta il confine tra il dominio e il mondo esterno.
Non contiene logica infrastrutturale, ma definisce contratti (Ports) che dovranno essere implementati dal layer Infrastructure.

**Contains**:
Behaviors(MediatR pipeline), DependencyInjection (only for .application level), Ports (interfaces), UseCases(slices e.g.Login, Logout,...)(each slice contains Orchestrator(the TRUE entry point), Handler, Command, Result, Policies, Loaders).

**References**: .Core </br>
thislayer usa il domain in .core e definisce le ports(interfaccie) che .infrastructure implementerà

---

### .INFRASTRUCTURE layer
Questo layer contiene tutte le integrazioni con sistemi esterni, come database, servizi di autenticazione, sistemi di storage e altri componenti infrastrutturali.
Implementa le interfacce (Ports) definite nell’Application layer ed è responsabile della persistenza dei dati, dei meccanismi di sicurezza e delle integrazioni esterne.

**Contains**:
EF Core repositories, JWT generation, Password hashing, Entities Configuration, ApplicationDbContext, UnitofWork, DataLoaders(Aggregates & Batch Loaders), DependencyInjection (only for .infrastructure level), Storage(for Hetzner Object media files), OutBox Processor.

**References**: .Application, .Core </br>
thislayer implementa i Ports definiti in .applicatione e usa le entities del .core

---

### .API layer
Questo layer espone il sistema tramite endpoint HTTP ed è responsabile della gestione delle richieste, della validazione, della serializzazione e della configurazione dell’API.
I controller non contengono logica di business e **non dipendono direttamente da MediatR**.
Invocano invece l’Orchestrator del relativo Use Case, mantenendo il layer HTTP sottile e disaccoppiato dalla pipeline applicativa.

**Contains**:
Requests & Responses (will match w Command & Result of the target UseCase), Mapping(x auto match request->command & result->response), ApiResult & ApiError (wrapper, for uniformity when return the response to the client), Controllers(don't know MediatR, they call the orchestrator of target usecase), Filters, Middleware(for global exception and correlationid for logging), Startup Extensions (authentication, authorization, correlationid, cors, healthchecks, swagger, validation), Validators(usa plugin Fluent Validator, for rules e.g. email must not be empty), Versioning, Program.cs.

**References**: .Application, .Infrastructure </br>
thislayer chiama gli usescases(only orchestrators) del .application e usa dependencyinjection registrata in .infrastructure

---

### Techniques & Patterns

- **Domain-First**: the domain model (in .Core) represents the source of truth, cosi il databse è scollegato(facilmente sostituibile!) ed non è trattato come system fundation (approach Db-First).
- **Clean Architecture**: project suddiviso in layers .API .Application .Infrastructure .Core, e le loro references. 
- **Domain Driven Design (DDD)**: la logica di business è incapsulata direttamente nel modello di dominio, evitando così logica dispersa nei servizi applicativi.
- **Boundaries tra Assemblies(projects)**: .applications/ports qui vengono definiti i contratti, la vero implementazione è dentro .infrastructure e.g.IUserRepository -> UserRepository, la risoluzione delle dipendenze avviene in servicecollectionextensions.cs così quando chiami l'interfaccia automaticamente viene chiamata l'implementazione, obbligatorio perche un prj non deve conosce le implementazioni dell'altro prj, ma solo le interfaccie: i boundaries sono rispettati (e i tests sono clean).
- **Mapping request->command & result->response nel controller**: grazie a plugin AutoMapper converto i dati ricevuti dal client in type xxRequest e lo converto in type xxCommand, nel file mapping e.g.requesttocommandprofile.cs non devi esplicitare come avviene la conversione SE i types & names matchano perfettamente e SE non vengono usati Value Objects (e.g.UserId). 
- **Api Result & Api Error**: la risposta che riceverà il client sara SEMPRE con la STESSA struttura, per qualsiasi tipo di risposta (200/201/404/...).
- **MediatR & Pipeline Bahviors**: plugin mediatr lavora come dispatcher, dal controller chiami l'orchestrator dello target slice usecase, e l'orchestrator fa partire la pipeline di behaviors controller -> orchestrator-> validationbehavior.cs -> loggingbehavior.cs -> performancebehavior.cs -> transactionbehavior.cs -> exceptionbehavior.cs -> handler target, quindi sono a 'cipolla'(dal controller penetri fino in fondo e poi torni in superfice)!
- **Unit Of Work Pattern**: solo transactionbehavior.cs chiama l'uow, che centralizza il SaveChangesAsync() al ritorno verso superfice dei dati elaborati.
- **Vertical Slice Architecture**: ogni 'usecase' è uno slice isolato, ogni slice si comporta come un mini microservice e.g. 
UseCases/Auth/Login/
    LoginCommand
    LoginOrchestrator
    LoginHandler 
    LoginResult
    Policies/  //regole
    Loaders/
- **Validations**: validationbehvior.cs sia in entrata che in uscita della pipeline valida i dati (usa plugin FluentValidator), controlla solo i file xxxValidator.cs che hanno xxxCommand target utilizzato (e.g. RegisterUserValidator : AbstractValidator<RUCommand>)
- **Aggregate Root Pattern**: solo gli aggregate root (e.g. User.cs e Subscriptions.cs) hanno il proprio repository, per modificare i figli devi passare dall'aggregate root, cosi la consistency è sempre garantita. 
- **Value Objects**: sostituisce i tipi primitivi where business meaning exists, e.g. UserId è uno struct.
- **Aggregates**: li uso per le READ queries per caricare AggregateRoot+combinazione dei suoi childrens, e restituisco in formato e.g. UserSharedLinksAggregate.cs (composizione a runtime). quindi .Include() assolutamente DA NON FARE perche crea mega-joins.
- **CQRS (Command Query Separation)**: WRITE e READ queries hanno business separato, per le reads quando c'è bisogno di caricare un blocco e.g voglio caricare tutte le subscriptions, uso i BATCHERS cioè Cuncurrent Batched queries, cosi invece di N richieste -> N query, faccio N richieste -> le accumulo -> faccio 1 sola batch query! e.g.SubscriptionBatchLoader.cs che simula esattamente il comportamento del modello di GraphQL DataLoaders! utilizzato anche da Uber.
- **ProjectctionsLoaders**: li uso quando voglio caricare dati tra aggregate separati, e.g. aggregateroot1+aggregateroot2 or aggregateroot1+(aggregateroot2)+aggregateroot2children., quindi xxxProjectionLoader.cs solitamente è solo x 1 solo caso d'uso. e.g.LoadDashboard() / LoadStats() ed il suo type return ('xxxxProjectionView.cs') non va nel domain ma resta nel .infrastructure(xk non è un business aggregate!).
- **Request-Scoped Cache**: cache della durata di 50-300ms per una singola http req, cosi se nella stessa http req viene richista e.g.3 volte lo stesso piece-data, allora solo la prima volta il piece-data viene caricato dal db, le altre 2 volte viene usata la cache per questa singola http req.
- **Domain Events**: rappresenta un'evento che accade quando succede qualcosa e.g UserRegisteredEvent.cs usato da UserRegisteredHandler.cs che puo fare per esempio logica di invio di email di benvenuto. 
- **Outbox Pattern (reliable events)**: per assicurarsi di e.g registrare utente + inviare email in una 1 sola transazione(COMMIT) (altrimenti magari la registrazione user ha successo ed è salvato su db, ma poi l'invio email fallisce). quindi Save Aggregate -> Save OutBox message -> COMMIT(salvi su db), dopodiche il background worker outboxprocessor.cs sempre attivo in modalità polling ogni 2sec legge ultime 20 righe della tabella db  outboxmessage (solo quelli non ancora done) e pubblica quegli eventi (e.g. invio email di benvenuto)!
- **Observability & Logging**: sempre chiaro logging di cosa è appena successo, ogni log fornito di chiara descrizione e di correlationId per poter facilmente tracciare cosa succede in real-time. see loggingbehavior.cs correlationidmiddleware.cs
- **Security**: il sistema di auth si basa su JWT(Json Web Tokens) dunque utilizzo access tokens(breve durata), refresh tokens(lunga durata) e jwt claims.
- **Media Upload**: su tab db usermedia sul db salvo solo i metadati, i file vengono archiviati su Hetzner Object storage.
- **Sentry**: L’applicazione utilizza Sentry per il monitoraggio in produzione, includendo:
    - Error tracking: tutte le eccezioni non gestite vengono automaticamente catturate
    - Centralized logging: log applicativi correlati agli errori
    - Performance tracing: monitoraggio delle performance delle API e delle richieste
    Le eccezioni vengono intercettate (es. tramite ExceptionBehavior o middleware) e inviate a Sentry con informazioni utili per il debugging, tra cui:
    - stack trace completo
    - correlation ID per tracciare la richiesta specifica
    - user ID (quando disponibile)
    - contesto della request
    Questo mi permette di identificare rapidamente problemi in produzione e risolverli in modo efficiente.

## Perché questa architettura è scalabile

L'architettura del progetto è costruita per supportare evoluzione, crescita del dominio e carichi applicativi crescenti senza compromettere la manutenibilità del sistema.

Le principali caratteristiche architetturali includono:

#### Explicit Transactional Boundaries
I confini transazionali sono definiti esplicitamente all'interno dell'Application Layer, garantendo consistenza dei dati e isolamento delle operazioni critiche.

#### Event-Driven Extensibility
La struttura applicativa è progettata per supportare facilmente un'evoluzione verso modelli event-driven, consentendo integrazioni asincrone e distribuite tra componenti del sistema.

#### Stateless API Design
L'API è completamente stateless, facilitando la scalabilità orizzontale tramite bilanciamento del carico e deploy su infrastrutture distribuite.

#### Independent Read/Write Models (CQRS mindset)
Le operazioni di lettura e scrittura sono separate concettualmente, permettendo ottimizzazioni indipendenti delle query e maggiore flessibilità nell'evoluzione dei modelli dati.

#### Background Processing Ready
L'architettura è predisposta per l'introduzione di processi asincroni e job in background (es. worker services, code di messaggi, task distribuiti).

#### Infrastructure Replaceability
Le dipendenze infrastrutturali sono completamente astratte, consentendo la sostituzione di componenti tecnici (database, sistemi di storage, provider di autenticazione) senza impattare la logica di dominio.


## SUBSNAP FRONTEND – ARCHITECTURE & ENGINEERING OVERVIEW

Next.js(ReactJS), TypeScript, TailwindCSS, react-errorboundary, js-cookie , lucide-react, React Hook Form, Zod, Motion, next-intl, Sentry.

## SUBSNAP DATABASE – ARCHITECTURE & ENGINEERING OVERVIEW

PostgreSQL 

```
--
-- PostgreSQL database cluster dump
--

-- Started on 2026-03-26 13:02:14

\restrict aw9Enub3klGUF0z4mwi8g0VHbi1rWOUcGiFYSBSjDQewHyo3lHXam6eFofJ6QIW

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:K2p8tI9cpDG7NNcyalqQDQ==$k24fu4NeRCk6pg6albCzHl8IUekhc76GZVRPnNGvagw=:O2OrrTOIPFRTBj6eVRSHUUUNtW3oSDy2LkBsqBUmZ+8=';

--
-- User Configurations
--

\unrestrict aw9Enub3klGUF0z4mwi8g0VHbi1rWOUcGiFYSBSjDQewHyo3lHXam6eFofJ6QIW

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict wPF5HSZgYKgEU5xeP072XnAqfd2nAljuQQDRaRSy0yxAYiZz0NefMsvjJg3cH2f

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-26 13:02:15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2026-03-26 13:02:20

--
-- PostgreSQL database dump complete
--

\unrestrict wPF5HSZgYKgEU5xeP072XnAqfd2nAljuQQDRaRSy0yxAYiZz0NefMsvjJg3cH2f

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict hw2WtpK6U2MG5SPJ2tgdaBE1q4qIS8SGhmZxcmyoqTq15cKRjswC6921Yl29QCH

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.1

-- Started on 2026-03-26 13:02:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16387)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3558 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 264 (class 1255 OID 16425)
-- Name: set_updatedat_sharedlinks(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updatedat_sharedlinks() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updatedat = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updatedat_sharedlinks() OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 16426)
-- Name: set_updatedat_subscriptions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updatedat_subscriptions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updatedat = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updatedat_subscriptions() OWNER TO postgres;

--
-- TOC entry 266 (class 1255 OID 16427)
-- Name: set_updatedat_users(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updatedat_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updatedat = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updatedat_users() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16428)
-- Name: outboxmessages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outboxmessages (
    id uuid NOT NULL,
    type text NOT NULL,
    payload jsonb NOT NULL,
    occurredonutc timestamp(3) with time zone NOT NULL,
    processedonutc timestamp(3) with time zone
);


ALTER TABLE public.outboxmessages OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16437)
-- Name: refreshtokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refreshtokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    userid uuid NOT NULL,
    token character varying(512) NOT NULL,
    expiresat timestamp(3) with time zone NOT NULL,
    isrevoked boolean DEFAULT false NOT NULL,
    createdat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refreshtokens OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16451)
-- Name: sharedlinks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sharedlinks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    userid uuid NOT NULL,
    link character varying(255) NOT NULL,
    expiresat timestamp(3) with time zone,
    views integer DEFAULT 0 NOT NULL,
    createdat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sharedlinks OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16464)
-- Name: subscriptionhistories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptionhistories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscriptionid uuid NOT NULL,
    action character varying(50) NOT NULL,
    oldvalue text,
    newvalue text,
    createdat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscriptionhistories OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16475)
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    userid uuid NOT NULL,
    name character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    billingcycle character varying(50) DEFAULT 'Mensile'::character varying NOT NULL,
    startdate date NOT NULL,
    enddate date,
    category character varying(50),
    createdat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16490)
-- Name: usermedia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usermedia (
    id uuid NOT NULL,
    userid uuid NOT NULL,
    objectkey text NOT NULL,
    contenttype character varying(100),
    size bigint,
    uploadedat timestamp(3) with time zone NOT NULL
);


ALTER TABLE public.usermedia OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16499)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    passwordhash character varying(512) NOT NULL,
    isactive boolean DEFAULT true NOT NULL,
    createdat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lastlogin timestamp(3) with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3546 (class 0 OID 16428)
-- Dependencies: 220
-- Data for Name: outboxmessages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.outboxmessages (id, type, payload, occurredonutc, processedonutc) FROM stdin;
453039b8-4057-4bfb-af8b-75ced86da26b	SubSnap.Core.Domain.Events.Users.UserRegisteredEvent, SubSnap.Core, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null	{"UserId": {"Value": "7970901e-6fb2-44b0-a1eb-4c9a582a7d45"}, "OccurredOnUtc": "2026-03-10T10:12:02.8743517Z"}	2026-03-10 10:12:02.982+00	2026-03-10 10:12:04.582+00
\.


--
-- TOC entry 3547 (class 0 OID 16437)
-- Dependencies: 221
-- Data for Name: refreshtokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refreshtokens (id, userid, token, expiresat, isrevoked, createdat) FROM stdin;
25c60c90-5a20-4932-8c9e-266140471957	7970901e-6fb2-44b0-a1eb-4c9a582a7d45	AQAAAAIAAYagAAAAENt1YOxsYoYBla+pvgVVkKyp+LvABlH3RoVF1JnPTNGEV1cS6lpRP0crxe/Doe5lHg==	2026-04-09 10:19:20.06+00	f	2026-03-10 10:19:20.06+00
\.


--
-- TOC entry 3548 (class 0 OID 16451)
-- Dependencies: 222
-- Data for Name: sharedlinks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sharedlinks (id, userid, link, expiresat, views, createdat, updatedat) FROM stdin;
\.


--
-- TOC entry 3549 (class 0 OID 16464)
-- Dependencies: 223
-- Data for Name: subscriptionhistories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptionhistories (id, subscriptionid, action, oldvalue, newvalue, createdat) FROM stdin;
\.


--
-- TOC entry 3550 (class 0 OID 16475)
-- Dependencies: 224
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, userid, name, amount, billingcycle, startdate, enddate, category, createdat, updatedat) FROM stdin;
\.


--
-- TOC entry 3551 (class 0 OID 16490)
-- Dependencies: 225
-- Data for Name: usermedia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usermedia (id, userid, objectkey, contenttype, size, uploadedat) FROM stdin;
\.


--
-- TOC entry 3552 (class 0 OID 16499)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, passwordhash, isactive, createdat, updatedat, lastlogin) FROM stdin;
d3d74169-029a-4b5f-ad35-30ddd8c16517	test@test.com	AQAAAAIAAYagAAAAELtocc5JvNqt5uFgSbd5/clBQGZnDtiv5p5m9cjEAxaFMiwsbuQQ2giQw2y+ZTeX9Q==	t	2026-02-21 19:26:08.436+00	2026-02-21 19:26:08.436+00	\N
7970901e-6fb2-44b0-a1eb-4c9a582a7d45	testXXX@test.com	AQAAAAIAAYagAAAAEFnz6jlP7h33F4T6gNsB6ptJNObeMnFcs9hjMGwOfHh7nVgGwot8ow4GzcHQhVIdgA==	t	2026-03-10 10:12:02.874+00	2026-03-10 10:12:02.874+00	\N
\.


--
-- TOC entry 3369 (class 2606 OID 16515)
-- Name: outboxmessages pk_outboxmessages; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outboxmessages
    ADD CONSTRAINT pk_outboxmessages PRIMARY KEY (id);


--
-- TOC entry 3372 (class 2606 OID 16517)
-- Name: refreshtokens pk_refreshtokens; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refreshtokens
    ADD CONSTRAINT pk_refreshtokens PRIMARY KEY (id);


--
-- TOC entry 3377 (class 2606 OID 16519)
-- Name: sharedlinks pk_sharedlinks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sharedlinks
    ADD CONSTRAINT pk_sharedlinks PRIMARY KEY (id);


--
-- TOC entry 3380 (class 2606 OID 16521)
-- Name: subscriptionhistories pk_subscriptionhistories; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptionhistories
    ADD CONSTRAINT pk_subscriptionhistories PRIMARY KEY (id);


--
-- TOC entry 3383 (class 2606 OID 16523)
-- Name: subscriptions pk_subscriptions; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT pk_subscriptions PRIMARY KEY (id);


--
-- TOC entry 3388 (class 2606 OID 16525)
-- Name: users pk_users; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (id);


--
-- TOC entry 3374 (class 2606 OID 16527)
-- Name: refreshtokens uq_refreshtokens_token; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refreshtokens
    ADD CONSTRAINT uq_refreshtokens_token UNIQUE (token);


--
-- TOC entry 3390 (class 2606 OID 16529)
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);


--
-- TOC entry 3386 (class 2606 OID 16531)
-- Name: usermedia usermedia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usermedia
    ADD CONSTRAINT usermedia_pkey PRIMARY KEY (id);


--
-- TOC entry 3367 (class 1259 OID 16532)
-- Name: ix_outboxmessages_processed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_outboxmessages_processed ON public.outboxmessages USING btree (processedonutc);


--
-- TOC entry 3370 (class 1259 OID 16533)
-- Name: ix_refreshtokens_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_refreshtokens_userid ON public.refreshtokens USING btree (userid);


--
-- TOC entry 3375 (class 1259 OID 16534)
-- Name: ix_sharedlinks_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sharedlinks_userid ON public.sharedlinks USING btree (userid);


--
-- TOC entry 3378 (class 1259 OID 16535)
-- Name: ix_subscriptionhistories_subscriptionid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_subscriptionhistories_subscriptionid ON public.subscriptionhistories USING btree (subscriptionid);


--
-- TOC entry 3381 (class 1259 OID 16536)
-- Name: ix_subscriptions_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_subscriptions_userid ON public.subscriptions USING btree (userid);


--
-- TOC entry 3384 (class 1259 OID 16537)
-- Name: ix_usermedia_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_usermedia_userid ON public.usermedia USING btree (userid);


--
-- TOC entry 3396 (class 2620 OID 16538)
-- Name: sharedlinks tr_sharedlinks_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_sharedlinks_update BEFORE UPDATE ON public.sharedlinks FOR EACH ROW EXECUTE FUNCTION public.set_updatedat_sharedlinks();


--
-- TOC entry 3397 (class 2620 OID 16539)
-- Name: subscriptions tr_subscriptions_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_subscriptions_update BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updatedat_subscriptions();


--
-- TOC entry 3398 (class 2620 OID 16540)
-- Name: users tr_users_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_users_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updatedat_users();


--
-- TOC entry 3391 (class 2606 OID 16541)
-- Name: refreshtokens fk_refreshtokens_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refreshtokens
    ADD CONSTRAINT fk_refreshtokens_users FOREIGN KEY (userid) REFERENCES public.users(id);


--
-- TOC entry 3392 (class 2606 OID 16546)
-- Name: sharedlinks fk_sharedlinks_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sharedlinks
    ADD CONSTRAINT fk_sharedlinks_users FOREIGN KEY (userid) REFERENCES public.users(id);


--
-- TOC entry 3393 (class 2606 OID 16551)
-- Name: subscriptionhistories fk_subscriptionhistories_subscriptions; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptionhistories
    ADD CONSTRAINT fk_subscriptionhistories_subscriptions FOREIGN KEY (subscriptionid) REFERENCES public.subscriptions(id);


--
-- TOC entry 3394 (class 2606 OID 16556)
-- Name: subscriptions fk_subscriptions_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT fk_subscriptions_users FOREIGN KEY (userid) REFERENCES public.users(id);


--
-- TOC entry 3395 (class 2606 OID 16561)
-- Name: usermedia fk_usermedia_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usermedia
    ADD CONSTRAINT fk_usermedia_user FOREIGN KEY (userid) REFERENCES public.users(id);


-- Completed on 2026-03-26 13:02:27

--
-- PostgreSQL database dump complete
--

\unrestrict hw2WtpK6U2MG5SPJ2tgdaBE1q4qIS8SGhmZxcmyoqTq15cKRjswC6921Yl29QCH

-- Completed on 2026-03-26 13:02:27

--
-- PostgreSQL database cluster dump complete
--

```
