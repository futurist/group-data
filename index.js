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
      "color": "3",
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
      x:{y:1}
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
  min: {$min: '$bb.cc.qty'},
  max: {$max: '$bb.cc.qty'},
  avg: {$avg: '$bb.cc.qty'},
  sum: {$sum: '$bb.cc.qty'},
  first: {$first: '$bb.cc.qty'},
  last: {$last: '$bb.cc.qty'},
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

var resultObj = {}

// create each level of path in resultObj
function createResultObj(data, path) {
  for(let i=0; i<path.length; i++) {
    data = data[path[i]]
    if(Array.isArray(data)) {
      let _path = path.slice(0,i+1).join('.')
      resultObj[_path] = resultObj[_path] || []
    }
  }
}

function groupData(data, stage){
  _.visit(data, v=>{
    const currentPath = v.path.concat(v.key)
    const _path = toStagePath(data, v.path, v.key)

    const $unwind = stage.$unwind
    if($unwind && _path != $unwind) return
    console.log('-----', toStagePath(data, v.path), v.path, _path, currentPath)

    createResultObj(data, currentPath)

    const entries = getEntry(data, stage, currentPath)
    if(!entries) return

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
          entries.forEach(entry=>{
          if(!entry) return
            // no match accum, skip
            switch( accum ) {
              case '$sum':
              case '$avg':
              case '$max':
              case '$min':
              if(!(i in entry)) entry[i] = makeArrayObject(accum, {skipNull: true})
              if(type==='string') {
                const arr = getDataInPath(data, currentPath, keyPath)
                entry[i].push(arr[0])
              } else {
                entry[i].push(keyPath)
              }
              return
              case '$push':
              if(!(i in entry)) entry[i] = []
              if(type==='string') {
                const arr = getDataInPath(data, currentPath, keyPath)
                entry[i].push(arr[0])
              }
              return
              case '$addToSet':
              if(!(i in entry)) entry[i] = []
              if(type==='string') {
                const arr = getDataInPath(data, currentPath, keyPath)
                $addToSet(entry[i], arr[0])
              }
              return
              case '$first':
              if(!(i in entry) && type==='string') {
                const arr = getDataInPath(data, currentPath, keyPath)
                entry[i] = arr[0]
              }
              return
              case '$last':
              if(type==='string') {
                const arr = getDataInPath(data, currentPath, keyPath)
                entry[i] = arr[0]
              }
              return
            }
          })
        })
      }
  })
}

function arrayObjectProp (method, options) {
  return {
    _options: {value: options},
    valueOf: {value: function() {
      return this[method]()
    }},
    toString: {value: function() {
      return String(this.valueOf())
    }},
    toJSON: {value: function() {
      return this.valueOf()
    }},
    _sum: {value: function() {
      return this.reduce((prev, cur)=>{
        return typeof cur=='number' && !isNaN(cur)
          ? prev + cur
          : prev
      }, 0)
    }},
    _avg: {value: function() {
      return this._sum() / this._count()
    }},
    _min: {value: function() {
      return Math.min.apply(null, this._getArray())
    }},
    _max: {value: function() {
      return Math.max.apply(null, this._getArray())
    }},
    _count: {value: function() {
      return this._getArray().length
    }},
    _getArray: {value: function() {
      return !this._options.skipNull
        ? this
        : this.filter(v=>v!=null)
    }},
  }
}

function makeArrayObject (method, options) {
  var arr = []
  var _method = method.replace(/^\$/, '_')
  Object.defineProperties(arr, arrayObjectProp(_method, options||{}))
  return arr
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
  ) {
    return
  }

  return Object.keys(resultObj).map(g=>{
    // console.log(currentPath, g, 9999)
    if( currentPath.join('.').indexOf(g) !== 0 ) return
    const result = resultObj[g]
    var entry = result.find(entry=>{
      return keyNames.every(
        key=>entry._id[key] === newEntry._id[key]
      )
    })
    if(entry==null) {
      entry = _.merge({}, newEntry)
      result.push(entry)
    }
    return entry
  })
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

  if(name != null) {
    if(Array.isArray(data)) p.push('$')
    else p.push(name)
  }

  // return [parentPath, '$'+p.join('.')]
  return '$'+p.join('.')
}

function isParent (path) {
  return path.length % 2 === 1
}

function isParentArray (subArr, parentArr) {
  return subArr.slice(0, -1).join() === parentArr.join()
}

groupData(data2, stage2)

var util=require('util')
console.log( util.inspect(resultObj, {depth:null}) )

module.exports = groupData


