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
      "qty": 32,
      // x:{y:1}
    }, {
      "item": "aa",
      "color": "2",
      "qty": 23
    },
    {c: {d: 1}}
    ],
    c:{b:{d:2}}
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
  $unwind: '$bb.cc.$',
  _id: {
    ITEM: '$bb.cc.item',
    COL: '$bb.cc.color',
  },
  asdf: {$sum: '$bb.cc.qty'},
  count: {$sum: 1}
}


var result = []

function v2(data, stage){
  _.visit(data, v=>{
    const _path = toStagePath(data, v.path, v.key)
    // return console.log('-----', v.val, v.path, _path)

    if(_path != stage.$unwind) return
    const currentPath = v.path.concat(v.key)
    const entry = getEntry(data, stage, currentPath)
    if(!entry) return

    for(let i in stage) {
      if(i==='_id') continue
      const accumObj = stage[i]
      Object.keys(accumObj).forEach(accum=>{
        const keyPath = accumObj[accum]
        // no match accum, skip
        switch( accum ) {
          case '$sum':
          if(!(i in entry)) entry[i] = 0
          if(typeof keyPath=='string') {
            const arr = getDataInPath(data, currentPath, keyPath)
            entry[i] += arr[0]|0
          } else if(typeof keyPath == 'number') {
            entry[i] += keyPath|0
          }
          break
        }
      })
    }

  })
}

v2(data2, stage2)

function getDataInPath(data, currentPath, targetPath) {
  // console.log(currentPath, targetPath)
  let path = targetPath.slice(1).split('.')
  let curPath = currentPath.slice()
  let cur
  while(cur=path.shift()) {
    curPath.shift()
    if(typeof data !== 'object' || !(cur in data)) {
      return [null, 1]
    }
    data = data[cur]
    while(Array.isArray(data)) {
      data = data[curPath.shift()]
    }
  }
  return [data]
}

function getEntry (data, stage, currentPath){
  const _id = stage._id
  const keyNames = Object.keys(_id)
  
  // new entry
  let newEntry = {_id:{}}
  if(
    ! keyNames.every(key=>{
      const arr = getDataInPath(data, currentPath, _id[key])
      if(arr[1]) {
        return false
      }
      newEntry._id[key] = arr[0]
      return true
    })
  ){
    return
  }


  var entry = result.find(entry=>{
    return keyNames.every(
      key=>entry._id[key] === newEntry._id[key]
    )
  })
  if(entry==null){
    entry = newEntry
    result.push(entry)
  }
  return entry
}

console.log(result)

function toStagePath(data, path, name){
  // return is array: [parentPath, currentPath]
  var p = []
  var parent
  for(var i=0; i< path.length; i++) {
    p.push(path[i])
    parent = data
    data = data[path[i]]
    while(i< path.length-1 && Array.isArray(data)) {
      parent = data
      data = data[path[++i]]
    }
  }

  // if(Array.isArray(parent)) {
  //   // console.log(p.concat('$').join())
  //   var parentPath = '$'+p.concat('$').join('.')
  // } else {
  //   var parentPath = '$'+p.join('.')
  // }

  if(Array.isArray(data)) p.push('$')
  else p.push(name)

  // return [parentPath, '$'+p.join('.')]
  return '$'+p.join('.')
}

function isParent (path) {
  return path.length % 2 === 1
}

function isParentArray (subArr, parentArr) {
  return subArr.slice(0, -1).join() === parentArr.join()
}

