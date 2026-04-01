namespace SubSnap.Core.Domain.ValueObjects;

public readonly struct UserMediaId
{
    public Guid Value { get; }
    public UserMediaId(Guid value)
    {
        if (value == Guid.Empty) throw new ArgumentException("Invalid UserMediaId");
        Value = value;
    }

    public static UserMediaId New() => new UserMediaId(Guid.NewGuid());  //generi nuovo Id!! COSI IL DOMAIN E' INDIPENDENTE DAL DB, e non devi fare un SaveChanges() solo per ottenere l'id delle nuova row!!

    public override string ToString() => Value.ToString();

    //equals
    public bool Equals(UserMediaId other) => Value.Equals(other.Value);
    public override bool Equals(object? obj) => obj is UserMediaId other && Equals(other);
    public static bool operator ==(UserMediaId left, UserMediaId right) => left.Equals(right);
    public static bool operator !=(UserMediaId left, UserMediaId right) => !(left == right);

    public override int GetHashCode() => Value.GetHashCode(); //x warning CS0659, xk quando fai override di Equal è consigliato farlo anche x GetHashCode()


}
