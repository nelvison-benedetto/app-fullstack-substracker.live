using SubSnap.Core.Domain.Common;
using SubSnap.Core.Domain.ValueObjects;

namespace SubSnap.Core.Domain.Entities;

//see IObjectStorageService.cs HetznerObjectStorageService.cs UserMedia.cs xxxhandler.cs
public class UserMedia : AggregateRoot
{
    public UserMediaId Id { get; private set; }
    public UserId UserId { get; private set; }

    public string ObjectKey { get; private set; }
    public string ContentType { get; private set; }
    public long Size { get; private set; }
    public DateTime UploadedAt { get; }

    //public string FileName { get; private set; }
    //public string Url { get; private set; }

    private UserMedia() { }  //constructor x ORM

    public UserMedia(
        UserId userId,
        string objectKey,
        string contentType,
        long size)
    {
        Id = UserMediaId.New();
        UserId = userId;
        ObjectKey = objectKey;
        ContentType = contentType;
        Size = size;
        UploadedAt = DateTime.UtcNow;
    }
}