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
      // "qty": 32,
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


var stage2 = {
  $unwind: '$bb.cc.$',
  _id: {
    ITEM: '$bb.cc.item',
    COL: '$bb.cc.color',
  },
  // _id: null,
  asdf: {$sum: '$bb.cc.qty'},
  // count: {$sum: 1},
  count2: {$sum: 1, $ensure: ['$bb.cc.qty']},
  aa: {$push: '$bb.bb'},
  bb: {$addToSet: '$bb.bb'},
}

// data2={a:{b:2}, c:3, d:4}
// stage2={
//   // $unwind: '$a',
//   _id:{c:'$c'}
// }

var result = []

function v2(data, stage){
  _.visit(data, v=>{
    const currentPath = v.path.concat(v.key)
    const _path = toStagePath(data, v.path, v.key)
    // return console.log('-----', v.val, v.path, _path, currentPath)

    const $unwind = stage.$unwind
    if($unwind && _path != $unwind) return
    const entry = getEntry(data, stage, currentPath)
    if(!entry) return

    for(let i in stage) {
      if(i==='_id') continue
      const accumObj = stage[i]
      if(!accumObj || typeof accumObj!='object') continue
      Object.keys(accumObj).forEach(accum=>{
        const keyPath = accumObj[accum]
        const $ensure = accumObj.$ensure

        // $ensure check for exists
        if(Array.isArray($ensure)){
          if($ensure.some(v=>{
            return getDataInPath(data, currentPath, v)[1]
          })){
            return
          }
        }
        const type = typeof keyPath
        // no match accum, skip
        switch( accum ) {
          case '$sum':
          if(!(i in entry)) entry[i] = arrayObj.$sum()
          if(type==='string') {
            const arr = getDataInPath(data, currentPath, keyPath)
            entry[i].push(arr[0])
          } else if(type === 'number') {
            entry[i].push(keyPath)
          }
          break
          case '$push':
          if(!(i in entry)) entry[i] = []
          if(type==='string') {
            const arr = getDataInPath(data, currentPath, keyPath)
            entry[i].push(arr[0])
          }
          break
          case '$addToSet':
          if(!(i in entry)) entry[i] = []
          if(type==='string') {
            const arr = getDataInPath(data, currentPath, keyPath)
            $addToSet(entry[i], arr[0])
          }
          break
        }
      })
    }

  })
}

var arrayObj = {
  $sum: function(){
    var arr = []
    var getData = function(isString){
      return this.reduce((prev, cur)=>{
        return typeof cur=='number' && !isNaN(cur)
          ? prev + cur
          : prev
      }, 0)
    }
    var toString = function(){
      return String(getData.apply(this))
    }
    Object.defineProperty(arr, 'valueOf', {value: getData})
    Object.defineProperty(arr, 'toString', {value: toString})
    Object.defineProperty(arr, 'toJSON', {value: getData})
    return arr
  }
}

function $addToSet(arr, item) {
  if(arr.indexOf(item)<0) arr.push(item)
}

function getDataInPath(data, currentPath, targetPath) {
  // console.log(currentPath, targetPath)
  let path = targetPath.slice(1).split('.')
  let curPath = currentPath.slice()
  let cur
  let provide = true
  while(cur=path.shift()) {
    if(curPath.shift()!=cur) provide= false
    if(typeof data !== 'object' || !(cur in data)) {
      return [null, 1]
    }
    data = data[cur]
    while(provide && Array.isArray(data)) {
      data = data[curPath.shift()]
    }
  }
  return [data]
}

function getEntry (data, stage, currentPath){
  let _id = stage._id
  if(_id==null || typeof _id!='object') _id = {}
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

v2(data2, stage2)
console.log( result)



