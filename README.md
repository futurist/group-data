# group-data
Group data like mongodb [$group][group] aggregate

[group]: https://docs.mongodb.com/manual/reference/operator/aggregation/group/#pipe._S_group

## Install

```
npm install group-data
```

## Usage

```javascript
var data = {
  abc: [
    {item: 'aa', qty: 15},
    {item: 'bb', qty: 20},
    {item: 'aa', qty: 30},
  ]
}
var stage = {
  $unwind: '$abc.$',
  _id: {
    item: '$abc.$.item'
  },
  sum: {$sum: '$abc.$.qty'},
  count: {$sum: 1}
}
var result = lib(data, stage)

assert.deepEqual(result, {
  abc: [
    {_id: {item: 'aa'}, sum: 45, count: 2},
    {_id: {item: 'bb'}, sum: 20, count: 1},
  ]
})
```

All array items in data should write as **$** in path string, other things like mongodb does.

Supported accumulator:

- $sum

- $avg

- $first

- $last

- $max

- $min

- $push

- $addToSet

