
var _ = require('objutil')
var clone = require('clone')
var {checkMatch, checkCondition} = require('./match.js')

/** Helper functions */
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
    $sum: {value: function() {
      return this.$getArray().reduce((prev, cur)=>{
        return typeof cur=='number' && !isNaN(cur)
          ? prev + cur
          : prev
      }, 0)
    }},
    $avg: {value: function() {
      return this.$sum() / this.$count()
    }},
    $min: {value: function() {
      return Math.min.apply(null, this.$getArray())
    }},
    $max: {value: function() {
      return Math.max.apply(null, this.$getArray())
    }},
    $count: {value: function() {
      return this.$getArray().length
    }},
    $getArray: {value: function() {
      return !this._options.skipNull
        ? this
        : this.filter(v=>v!=null)
    }},
  }
}

function makeArrayObject (method, options) {
  var arr = []
  // var _method = method.replace(/^\$/, '_')
  Object.defineProperties(arr, arrayObjectProp(method, options||{}))
  return arr
}

function $addToSet(arr, item) {
  if(arr.indexOf(item)<0) arr.push(item)
}

function checkValidKey(data, key){
  return typeof data !== 'object' || data==null || !(key in data)
}

function toStagePath(data, path, name){
  // return is array: [parentPath, currentPath]
  var p = []
  var parent
  for(var i=0; i< path.length; i++) {
    p.push(Array.isArray(data)
      ? '$'
      : path[i]
    )
    parent = data
    data = data[path[i]]
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


// interateDataInPath({
//   a: [{b: {c: {d: 2}}}]
// }, 'a.0.b.c.d'.split('.'), v=>{
//   console.log(v)
// })
function interateDataInPath(data, currentPath, callback) {
  let path = currentPath.slice()
  for(let cur, i=0; i<path.length; i++) {
    cur = path[i]
    if(checkValidKey(data, cur)) {
      callback({
        fail: true,
        key: cur,
        path: path.slice(0,i),
        col: data
      })
      return
    } else {
      if(callback({
        key: cur,
        val: data[cur],
        path: path.slice(0,i),
        col: data
      })===false) return
    }
    data = data[cur]
  }
}

function getDataInPath(data, currentPath, targetPath) {
  // console.log(currentPath, targetPath)
  let path = Array.isArray(targetPath)
    ? targetPath.slice()
    : targetPath.slice(1).split('.')
  let curPath = currentPath.slice()
  let cur
  let provide
  while(cur=path.shift()) {
    provide = curPath.shift()
    if(cur=='$') cur = provide
    if(checkValidKey(data, cur)) {
      return [null, 1]
    }
    data = data[cur]
  }
  return [data]
}


/** Main funciton */

// create each level of path in resultObj
function createResultObj(resultObj, data, path, stage) {
  const {$_showKeys} = stage
  for(let i=0; i<path.length; i++) {
    if(Array.isArray(data)) {
      let _path = path.slice(0,i).join('.')
      if(Array.isArray($_showKeys) && $_showKeys.indexOf(_path)<0) continue
      resultObj[_path] = resultObj[_path] || []
    }
    data = data[path[i]]
    // console.log(data)
  }
}

// get each level entry from path arr
function getEntry (resultObj, data, stage, currentPath){
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
  }).filter(Boolean)
}

function checkFactory(data, stage, currentPath) {
  return function (key, defaultVal, callback) {
    if(!(key in stage)) return defaultVal
    return [].concat(stage[key]).some(
      v=>{
        if(_.isIterable(v)) {
          if(v.$values) {
            let match = false
            let cond = v.$values
            let hintKeys = v.$keys
            let parent = null
            interateDataInPath(data, currentPath, x=>{
              // for ... in will not throw if it's null
              for(let key in x.val) {
                // $.keys is the hint key for match
                // console.log( key, hintKeys, checkCondition(key, hintKeys) )
                if(!hintKeys || checkCondition(key, hintKeys)) {
                  match = checkCondition(x.val[key], cond)
                  if(match){
                    // console.log(x.path, i)
                    callback && callback(x, key)
                    return false
                  }
                }
              }
            })
            return match
          } else {

            let match = false
            let parent = null
            const pathCond = v.$path || toStagePath(data, currentPath)
            interateDataInPath(data, currentPath, x=>{
              const path = toStagePath(data, x.path, x.key)
              // console.log(x.val, path, targetPath, path!==targetPath)
              // console.log(path, pathCond, checkCondition(path, pathCond))
              if(!checkCondition(path, pathCond)) return
              match = checkMatch(x.val, v.$test)
              if(match) {
                callback && callback(x)
                return false
              }
              parent = x.val
            })
            return match
          }
        }
      }
    )
  }
}

// usage: groupData(data, stage)
function groupData(data, stage, options) {
  options = options || {}
  data = clone(data)
  var resultObj = {}
  const $unwind = stage.$unwind
  const unwindCheckPath = $unwind && $unwind.slice(1).split('.').map(v=>v=='$'?0:v)
  _.visit(data, v=>{
    const currentPath = v.path.concat(v.key)
    const _path = toStagePath(data, v.path, v.key)

    // console.log('-----', _path, currentPath)
    
    if($unwind && $unwind.indexOf(_path)==0 && _path.length<$unwind.length){
      // ensure $unwind path exists
      let remainPath = $unwind.slice(_path.length+1).split('.').map(v=>v=='$'?0:v)
      let path = currentPath.concat(remainPath)
      // ensure all remain array have 0 index
      let obj = data
      while(path[0]!=null){
        let key = path.shift()
        if(!(key in obj)){
          obj[key]= path[0]==0?[]:{}
        }
        obj = obj[key]
      }
    }
    
    if($unwind && _path != $unwind) return
    
    // check for include, exclude
    const checkFunc = checkFactory(data, stage, currentPath)
    if(checkFunc('$exclude', false, options.onExclude)) return
    if(!checkFunc('$include', true, options.onInclude)) return

    createResultObj(resultObj, data, currentPath, stage)

    const entries = getEntry(resultObj, data, stage, currentPath)
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
              case '$count':
              if(!(i in entry)) entry[i] = makeArrayObject(accum, options)
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

  return resultObj
}

groupData.checkMatch = checkMatch
groupData.checkCondition = checkCondition

// var util=require('util')
// console.log(util.inspect(groupData(data2, stage2).valueOf(), {depth:null}))
// groupData(data2, stage2)

// // console.log( util.inspect(resultObj, {depth:null}) )
// console.log( JSON.stringify(groupData(data2, stage2), null, 2) )

module.exports = groupData


