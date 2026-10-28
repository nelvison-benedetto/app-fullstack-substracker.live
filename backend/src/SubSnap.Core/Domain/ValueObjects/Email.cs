using System.Text.RegularExpressions;

namespace SubSnap.Core.Domain.ValueObjects;

public readonly struct Email  //e readonly STRUCT!! ottimo x value objs (immutabile dopo la creazione)
{
    // RFC-5321 semplificato: almeno un char@almeno un char.almeno un char
    private static readonly Regex EmailRegex =   //regular expression (regex)
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    //rules x accettazione: almeno 1 char valido prima di '@', necessaria una '@', almeno un char valido, almeno un '.', almeno un carattere valido. 


    public string Value { get; }  //no setter x settarla dall'esterno
    public Email(string value)  //constructor
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email is required");

        if (!EmailRegex.IsMatch(value))  //applichi ur regex 
            throw new ArgumentException($"'{value}' is not a valid email address");

        Value = value.ToLowerInvariant();  //normalizza sempre in lowercase per evitare duplicati (es. User@Example.com == user@example.com)!
    }

    public override string ToString() => Value;  //return in string type

    //equals

    public bool Equals(Email other) => Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);
    //confronti le email ignorando maiuscole/minuscole, e.g.User@Example.com == user@example.com

    public override bool Equals(object? obj) => obj is Email other && Equals(other);   //stessa cosa, ma con object generico 
    /* cosi puoi fare
     object a = new Email("test@mail.com");
     object b = new Email("test@mail.com");
     a.Equals(b);  //ok
     */

    public static bool operator ==(Email left, Email right) => left.Equals(right);  //cosi puoi usare == nel code
    //cosi puoi fare e.g. if (email1 == email2)  //ok

    public static bool operator != (Email left, Email right) => !(left == right);   //cosi puoi usare != nel code

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);
    //quando fai Equals, se i 2 obj sono uguali, allora devono avere lo stesso hash code, altrimenti potresti avere problemi quando usi Email come chiave in un dizionario o in un HashSet. Quindi devi assicurarti che GetHashCode sia coerente con Equals, e quindi devi ignorare maiuscole/minuscole anche qui.

}
