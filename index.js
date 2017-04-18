var data00 = {
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


var data2 = {
  "id": "86b2a5aa-6b0e-4043-8d8d-1f5f3fdb74b9",
  "type": "form_aweawe",
  "bb": [{
    "bb": "bb",
    "cc": [{
      "item": "bb",
      "color": "1",
      "qty": 23
    }, {
      "item": "bb",
      "color": "2",
      "qty": 23
    }, {
      "item": "bb",
      "color": "3",
      "qty": 34
    }, {
      "item": "aa",
      "color": "2",
      "qty": 54
    }]
  }, {
    "bb": "aa",
    "cc": [{
      "item": "aa",
      "color": "1",
      "qty": 23
    }, {
      "item": "aa",
      "color": "2",
      "qty": 223
    }, {
      "item": "aa",
      "color": "1",
      "qty": 32
    }, {
      "item": "aa",
      "color": "2",
      "qty": 23
    }]
  }]
}

var _ = require('objutil')

var map = new Map()

var stage00 = {
  _id: {
    '$goods.person1': {
      item: 'ITEM',
      color: 'COL'
    }
  },
  asdf: {$sum: 'qty'},
}

var stage2 = {
  _id: {
    ITEM: '$bb.bb',
    // COL: '$bb.cc.color',
  },
  asdf: {$sum: '$bb.cc.qty'},
}


var result = []

function v2(data, stage){
  _.visit(data, v=>{
    const _path = toStagePath(v.path, v.key)

    for(let i in stage){
      if(i==='_id') continue
      const accumObj = stage[i]
      Object.keys(accumObj).forEach(accum=>{
        const keyPath = accumObj[accum]
        // no match accum, skip
        if(keyPath != _path) return
        const entry = getEntry(data, stage, v.path)
        switch( accum ) {
          case '$sum':
          if(!(i in entry)) entry[i] = 0
          entry[i] += v.val
          break
        }
      })
    }

  })
}

v2(data2, stage2)

function getDataInPath(data, currentPath, targetPath) {
  let path = targetPath.slice(1).split('.')
  let curPath = currentPath.slice()
  let cur
  while(cur=path.shift()) {
    curPath.shift()
    data = data[cur]
    if(Array.isArray(data)) {
      data = data[curPath.shift()]
    }
  }
  return data
}

function getEntry (data, stage, currentPath){
  const _id = stage._id
  const keyNames = Object.keys(_id)
  
  var entry = result.find(entry=>{
    return keyNames.every(
      key=>entry._id[key] == getDataInPath(data, currentPath, _id[key])
    )
  })
  if(entry==null){
    // new entry
    entry = {_id:{}}
    keyNames.forEach(key=>{
      entry._id[key] = getDataInPath(data, currentPath, _id[key])
    })
    result.push(entry)
  }
  return entry
}

function v1(data, stage) {
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
}
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

