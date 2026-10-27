using System.Collections.Concurrent;

namespace SubSnap.Infrastructure.Caching;

/*
Request-Scoped Cache: vive solo durante una singola http req, dura 50-300ms, serve ad evitare che magari nella http req chiami 3 volte esempio l'user target, allora non fa 3 loads dell'user ma fa solo 1(la prima volta) e le altre 2 sfrutta la cache.
Aumenta del 40% le performances delle http reqs!
LO UTILIZZO IN TUTTI I LOADS, BATCHERS no xk è gia una forma di cache temporanea, PROJECTIONSLOADS no xk non carica i dati dal db (fa orchestrazione).
 */
public class QueryCache
{

    private readonly ConcurrentDictionary<string, object> _cache = new();  //crei dizionario key-value

    public bool TryGet<T>(string key, out T value)  //può restituire un valore attraverso un parametro, oltre al normale valore di ritorno del metodo
    {
        if (_cache.TryGetValue(key, out var obj)  &&  obj is T typed)  //cerca valore nel dizionario, obj is T typed check se il type di obj è compatibile con T se si allora rendilo disponibile con nome 'typed'
        {
            value = typed;  //setta il param 'value', che puo essere recuperato dal chiamante con e.g. if (cache.TryGet<User>("user:123", out var cachedUser)){Console.WriteLine(cachedUser.Email);}
            return true;
        }
        value = default!;
        return false;
    }

    public void Set<T>(string key, T value)
    {
        _cache[key] = value!;
    }

}
