using AssetFlow.Models;
using MongoDB.Driver;

namespace AssetFlow.Repositories;

public interface ICounterRepository
{
    Task<long> GetNextSequenceValueAsync(string sequenceName);
}

public class CounterRepository : ICounterRepository
{
    private readonly IMongoCollection<Counter> _collection;

    public CounterRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Counter>("Counters");
    }

    public async Task<long> GetNextSequenceValueAsync(string sequenceName)
    {
        var filter = Builders<Counter>.Filter.Eq(c => c.Id, sequenceName);
        var update = Builders<Counter>.Update.Inc(c => c.Seq, 1);
        var options = new FindOneAndUpdateOptions<Counter>
        {
            ReturnDocument = ReturnDocument.After,
            IsUpsert = true
        };

        var result = await _collection.FindOneAndUpdateAsync(filter, update, options);
        return result.Seq;
    }
}
