var data = {
  "_id": "86b2a5aa-6b0e-4043-8d8d-1f5f3fdb74b9",
  "goods": [
    {
      "person1": [{
          "item": "bb",
          "color": "1",
          "qty": 23
        }],
    },
    {
      abc: {abc: 23},
      "person1": [{
          "item": "bb",
          "color": "1",
          "qty": 23
        },
        {
          "item": "bb",
          "color": "2",
          "qty": 24
        },
        {
          "item": "bb",
          "color": "1",
          "qty": 34
        },
        {
          "item": "aa",
          "color": "2",
          "qty": 54
        }
      ]
    },
    {
      "person2": [{
          "item": "aa",
          "color": "1",
          "qty": 23
        },
        {
          "item": "aa",
          "color": "2",
          "qty": 223
        },
        {
          "item": "aa",
          "color": "1",
          "qty": 32
        },
        {
          "item": "aa",
          "color": "2",
          "qty": 23
        }
      ]
    }
  ]
}

var _ = require('objutil')

var map = new Map()

var stage = {
  _id: {
    '$goods.person1': {
      item: 'ITEM',
      color: 'COL'
    }
  },
  asdf: {$sum: 'qty'},
}

var result = []

_.visit(data, v=>{
  const _path = toStagePath(v.path, v.key)
  console.log(v.path, v.key, _path)
  const cond = stage._id[_path]
  if( cond ) {
    v.val.forEach(data=>{

      const indexKeys = Object.keys(cond)
      var entry = result.find(entry=>{
        return indexKeys.every(
          key=>entry._id[cond[key]] == data[key]
        )
      })
      if(entry==null){
        // new entry
        entry = {_id:{}}
        indexKeys.forEach(key=>{
          entry._id[cond[key]] = data[key]
        })
        result.push(entry)
      }

      for(let i in stage){
        if(i=='_id') continue
        const accumObj = stage[i]
        Object.keys(accumObj).forEach(accum=>{
          const key = accumObj[accum]
          switch( accum ) {
            case '$sum':
            if(!(i in entry)) entry[i] = 0
            entry[i] += data[key]
            break
          }
        })
      }

    })
  }
})

console.log(result)

function toStagePath(path, name){
  var p = []
  for(var i=0; i< path.length; i+=2) {
    p.push(path[i])
  }
  p.push(name)
  return '$'+p.join('.')
}

function isParent (path) {
  return path.length % 2 === 1
}

function isParentArray (subArr, parentArr) {
  return subArr.slice(0, -1).join() === parentArr.join()
}

