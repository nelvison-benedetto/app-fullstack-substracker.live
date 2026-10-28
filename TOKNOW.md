================================================================================
GUIDA COMPLETA ALLE EF CORE MIGRATIONS — SubSnap
================================================================================

================================================================================
COS'E' UNA MIGRATION E COME FUNZIONA (concetto base)
================================================================================

Una migration è un file C# generato automaticamente da EF Core che descrive
COSA CAMBIA nel database rispetto alla versione precedente.

EF Core confronta:
  - Il tuo codice C# attuale (entities + IEntityTypeConfiguration)
  - Lo snapshot dell'ultimo stato conosciuto (ApplicationDbContextModelSnapshot.cs)
  ...e genera un file con le istruzioni SQL per passare da uno stato all'altro.

Sul database viene creata automaticamente una tabella speciale:
  __EFMigrationsHistory
Questa tabella registra quali migrations sono già state applicate.
Ogni volta che esegui "database update", EF controlla questa tabella e applica
SOLO le migrations che mancano. E' completamente idempotente e sicuro.

File generati nella cartella SubSnap.Infrastructure/Persistence/Migrations/:
  20260326120000_InitialCreate.cs           <- Up() e Down() della migration
  20260326120000_InitialCreate.Designer.cs  <- metadata interno EF (non toccare)
  ApplicationDbContextModelSnapshot.cs      <- snapshot del modello attuale (non toccare)

Up()   = cosa fare per APPLICARE la migration (aggiungere colonna, creare tabella, ecc.)
Down() = cosa fare per ANNULLARE la migration (rollback)


================================================================================
PREREQUISITI — verifica che siano installati
================================================================================

1. Tool EF Core globale (installalo una volta sola sulla macchina):
   dotnet tool install --global dotnet-ef

   Per aggiornarlo in futuro:
   dotnet tool update --global dotnet-ef

   Per verificare che sia installato:
   dotnet ef --version

2. Il progetto SubSnap.Infrastructure ha gia' questi pacchetti nel .csproj:
   - Microsoft.EntityFrameworkCore.Design
   - Microsoft.EntityFrameworkCore.Tools
   - Npgsql.EntityFrameworkCore.PostgreSQL
   (sono gia' presenti, non devi fare nulla)


================================================================================
DOVE ESEGUIRE I COMANDI POWERSHELL
================================================================================

Tutti i comandi vanno eseguiti dalla cartella:
  backend/src/SubSnap.API/

Questo perche' SubSnap.API e' lo startup project (ha appsettings.json con
la connection string e il Program.cs che configura tutto).

cd backend\src\SubSnap.API


================================================================================
STEP 1 — PRIMA MIGRATION BASELINE (da fare UNA SOLA VOLTA sul db gia' esistente)
================================================================================

SITUAZIONE: il tuo DB e' gia' live con le tabelle create via SQL puro.
EF Core non sa nulla di questo DB. Dobbiamo "adottarlo" senza toccarlo.

--- STEP 1A: genera la migration baseline ---

dotnet ef migrations add InitialCreate `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project . `
    --output-dir Persistence\Migrations

Cosa fa questo comando:
  - Legge tutti i tuoi IEntityTypeConfiguration<> e DbSet<>
  - Confronta con lo snapshot (che non esiste ancora, quindi e' tutto "nuovo")
  - Genera i file nella cartella SubSnap.Infrastructure/Persistence/Migrations/
  - Il file si chiamera' YYYYMMDDHHMMSS_InitialCreate.cs

--- STEP 1B: svuota il metodo Up() — CRITICO, NON SALTARE ---

Apri il file generato YYYYMMDDHHMMSS_InitialCreate.cs
Troverai un metodo Up() pieno di CreateTable(), CreateIndex(), ecc.
SVUOTALO completamente cosi':

    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Baseline migration.
        // Il DB esiste gia' con tutte le tabelle create via SQL puro.
        // Questo Up() e' intenzionalmente vuoto: EF registrera' solo questa
        // migration in __EFMigrationsHistory senza toccare il database.
    }

Lascia Down() com'e' (o svuotalo anche quello, non importa per la baseline).

PERCHE' E' CRITICO: se non svuoti Up(), EF cerchera' di creare tabelle che
esistono gia' e il comando crashera' con errore "relation already exists".

--- STEP 1C: applica la baseline al DB live ---

dotnet ef database update `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .

Cosa fa: si connette al DB, crea la tabella __EFMigrationsHistory (se non esiste),
e scrive il record "InitialCreate" dentro. NON tocca nessuna delle tue tabelle.

--- STEP 1D: verifica sul DB (opzionale ma consigliato) ---

Connettiti al tuo PostgreSQL e lancia:
  SELECT * FROM "__EFMigrationsHistory";

Dovresti vedere una riga con MigrationId = "YYYYMMDDHHMMSS_InitialCreate".
Se la vedi, sei a posto. EF ora "conosce" il tuo DB.


================================================================================
STEP 2 — WORKFLOW NORMALE (ogni volta che modifichi la struttura del DB)
================================================================================

Esempio pratico: vuoi aggiungere la colonna "emailverified" alla tabella users.

--- PASSO A: modifica il codice C# ---

1. Aggiungi la proprieta' all'entity in SubSnap.Core:
   public bool EmailVerified { get; private set; } = false;

2. Aggiungi la configurazione in SubSnap.Infrastructure/Persistence/Configurations/UserConfiguration.cs:
   builder.Property(u => u.EmailVerified)
       .HasColumnName("emailverified")
       .HasDefaultValue(false)
       .IsRequired();

--- PASSO B: genera la nuova migration ---

dotnet ef migrations add AddEmailVerifiedToUsers `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .

Cosa fa: confronta il codice attuale con lo snapshot salvato (ApplicationDbContextModelSnapshot.cs)
e genera un file con SOLO le differenze (in questo caso: AddColumn emailverified).
Non tocca ancora il DB.

--- PASSO C: controlla il SQL che verra' eseguito (FALLO SEMPRE!) ---

dotnet ef migrations script `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project . `
    --idempotent

Cosa fa: genera il SQL puro corrispondente alle migrations non ancora applicate.
--idempotent aggiunge un controllo IF NOT EXISTS cosi' il SQL e' rieseguibile
senza errori. Leggi questo output con attenzione prima di applicare al DB live.

Puoi anche generare lo script solo tra due migrations specifiche:
dotnet ef migrations script InitialCreate AddEmailVerifiedToUsers `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .

--- PASSO D: applica la migration al DB live ---

dotnet ef database update `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .

Cosa fa: si connette al DB, controlla __EFMigrationsHistory, trova che
"AddEmailVerifiedToUsers" non e' ancora stata applicata, esegue il suo Up(),
poi aggiunge il record in __EFMigrationsHistory. Fine.

--- PASSO E: verifica ---

SELECT * FROM "__EFMigrationsHistory";
-- dovresti vedere 2 righe: InitialCreate e AddEmailVerifiedToUsers

\d users
-- dovresti vedere la nuova colonna emailverified


================================================================================
COMANDI UTILI — riferimento rapido
================================================================================

# Vedi tutte le migrations e il loro stato (Applied / Pending)
dotnet ef migrations list `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .

# Torna indietro a una migration precedente (rollback)
# Attenzione: esegue il Down() della migration corrente!
dotnet ef database update NomeMigrationPrecedente `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .

# Rimuovi l'ultima migration generata (se non e' ancora stata applicata al DB)
dotnet ef migrations remove `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .

# Genera SQL script di tutte le migrations (utile per audit o per applicare manualmente)
dotnet ef migrations script `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project . `
    --output script_migrations.sql `
    --idempotent

# Verifica che EF riesca a connettersi al DB
dotnet ef dbcontext info `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project .


================================================================================
CONNESSIONE A UN DB SPECIFICO (es. produzione vs locale)
================================================================================

Per default EF usa la connection string in appsettings.json (o appsettings.Development.json).
Se vuoi puntare esplicitamente a un altro DB (es. il DB di produzione):

dotnet ef database update `
    --project ..\SubSnap.Infrastructure\ `
    --startup-project . `
    --connection "Host=tuo-server;Port=5432;Database=subsnap;Username=postgres;Password=tuapassword"

ATTENZIONE: non mettere mai la password di produzione in un file committato su git.
Usa variabili d'ambiente o secrets manager.


================================================================================
REGOLE D'ORO DA RISPETTARE SEMPRE
================================================================================

1. MAI modificare direttamente il DB online con SQL a mano (dopo aver impostato le migrations).
   Tutto passa dal codice C# -> migration -> database update.

2. SEMPRE eseguire "migrations script --idempotent" e leggere il SQL PRIMA di "database update".
   Non applicare mai ciecamente una migration al DB di produzione.

3. MAI cancellare o modificare manualmente i file in Migrations/ gia' applicati al DB.
   Puoi modificare solo l'ultima migration generata SE non e' ancora stata applicata.

4. I file Migrations/ vanno committati su git insieme al codice che li ha generati.
   Migration e codice devono sempre viaggiare insieme nello stesso commit.

5. MAI usare "database update" direttamente su produzione senza aver testato su un DB locale
   o di staging prima.

6. Il file ApplicationDbContextModelSnapshot.cs e' gestito automaticamente da EF.
   Non toccarlo mai manualmente.


================================================================================
AUTO-MIGRATE AL STARTUP (sconsigliato per produzione, ma possibile)
================================================================================

Se vuoi che il DB si aggiorni automaticamente ogni volta che l'app parte,
aggiungi questo in Program.cs subito dopo "var app = builder.Build()":

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();
    }

PERCHE' E' SCONSIGLIATO IN PRODUZIONE:
- Se una migration e' sbagliata, l'app la applica al DB prima che tu possa fermarla
- Non hai modo di leggere il SQL prima che venga eseguito
- In ambienti con piu' istanze (load balancer) puo' causare race conditions
- Meglio applicare le migrations manualmente e consapevolmente prima del deploy

PER SVILUPPO LOCALE va benissimo, risparmia tempo.


================================================================================
STRUTTURA FILE GENERATI (per capire cosa c'e' nella cartella Migrations)
================================================================================

SubSnap.Infrastructure/
  Persistence/
    Migrations/
      20260326120000_InitialCreate.cs          <- migration 1 (baseline, Up() vuoto)
      20260326120000_InitialCreate.Designer.cs <- metadata EF (non toccare)
      20260401093000_AddEmailVerifiedToUsers.cs <- migration 2 (vera modifica)
      20260401093000_AddEmailVerifiedToUsers.Designer.cs
      ApplicationDbContextModelSnapshot.cs     <- snapshot attuale del modello (non toccare)

Il prefisso numerico e' il timestamp di quando hai eseguito "migrations add".
EF le applica in ordine cronologico.
