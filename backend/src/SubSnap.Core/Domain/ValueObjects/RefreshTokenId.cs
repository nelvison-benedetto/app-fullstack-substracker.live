namespace SubSnap.Core.Domain.ValueObjects;

readonly struct RefreshTokenId
{
    public Guid Value { get; }
    public RefreshTokenId(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("RefreshTokenId cannot be empty GUID");
        Value = value;
    }
    public static RefreshTokenId New() => new RefreshTokenId(Guid.NewGuid());  //generi nuovo Id!! COSI IL DOMAIN E' INDIPENDENTE DAL DB, e non devi fare un SaveChanges() solo per ottenere l'id delle nuova row!!

    public override string ToString() => Value.ToString();

    //equals
    public bool Equals(RefreshTokenId other) => Value.Equals(other.Value);
    public override bool Equals(object? obj) => obj is RefreshTokenId other && Equals(other);
    public static bool operator ==(RefreshTokenId left, RefreshTokenId right) => left.Equals(right);
    public static bool operator !=(RefreshTokenId left, RefreshTokenId right) => !(left == right);

    public override int GetHashCode() => Value.GetHashCode(); //x warning CS0659, xk quando fai override di Equal è consigliato farlo anche x GetHashCode()
}
