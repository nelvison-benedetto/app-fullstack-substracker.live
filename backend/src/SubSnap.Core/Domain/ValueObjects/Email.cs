using System.Text.RegularExpressions;

namespace SubSnap.Core.Domain.ValueObjects;

public readonly struct Email  //e readonly struct
{
    // RFC-5321 semplificato: almeno un char@almeno un char.almeno un char
    private static readonly Regex EmailRegex =
        new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; }
    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Email is required");

        if (!EmailRegex.IsMatch(value))
            throw new ArgumentException($"'{value}' is not a valid email address");

        Value = value.ToLowerInvariant();  //normalizza sempre in lowercase per evitare duplicati (es. User@Example.com == user@example.com)
    }

    public override string ToString() => Value;

    //equals
    public bool Equals(Email other) => Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);
    public override bool Equals(object? obj) => obj is Email other && Equals(other);
    public static bool operator ==(Email left, Email right) => left.Equals(right);
    public static bool operator !=(Email left, Email right) => !(left == right);

    public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);
}
