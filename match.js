var _ = require('objutil')

function checkMatch (checkObj, condition){
  return _.isIterable(checkObj)
    && _.isIterable(condition)
    && Object.keys(condition).every(
      v=>checkCondition(checkObj[v], condition[v], checkObj)
    )
}

// console.log(checkMatch(null, {name:/o/, id:{$lt: 33}}) )

function checkCondition(value, cond, contextObj){
  if(_.isPrimitive(cond)) {
    return value === cond
  } else if (_.is(cond, 'RegExp')) {
    return cond.test(value)
  } else if (_.is(cond, 'Object')) {
    return Object.keys(cond).every(key=>
      checkOne(value, key, cond[key], contextObj))
  } else if (Array.isArray(cond)) {
    return cond.some(v=>checkCondition(value, v, contextObj))
  }
}

// It's one condition object item
// {$gt: 3}, left==$gt, right=3
// contextObj is the object provide the dot-path of relation of checkVal
// e.g. $gt: '$age', $age will be looked up in contextObj
function checkOne(checkVal, left, right, contextObj) {
  const isArray = Array.isArray
  const isPrimitive = _.isPrimitive(checkVal)
  switch(left){

    case '$gt': return isPrimitive && checkVal > right
    case '$lt': return isPrimitive && checkVal < right
    case '$gte': return isPrimitive && checkVal >= right
    case '$lte': return isPrimitive && checkVal <= right
    case '$eq': return isPrimitive && checkVal === right
    case '$ne': return isPrimitive && checkVal !== right

    case '$regex': return isPrimitive && _.is(right, 'RegExp') && right.test(checkVal)

    case '$mod': return isPrimitive && isArray(right) && checkVal % right[0] === right[1]

    case '$in': return isArray(right) && right.indexOf(checkVal)>-1
    case '$nin': return isArray(right) && right.indexOf(checkVal)<0

    case '$all': return isArray(checkVal) 
      && isArray(right) 
      && right.every(v=>checkVal.indexOf(v)>-1)

    case '$elemMatch': return isArray(checkVal)
      && checkVal.some(v=>checkCondition(v, right, contextObj))

    case '$not': return !checkCondition(checkVal, right, contextObj)

    case '$or': return isArray(right)
      && checkCondition(checkVal, right, contextObj)

    case '$and': return isArray(right)
      && right.every(v=>checkCondition(checkVal, v, contextObj))

  }
}

// console.log(checkExclude({
//   $exclude: 23
// }, '23'))

// console.log(checkOne([13, 2], '$elemMatch', 3))

// console.log(checkCondition(
//   3
//   [
//     {$not: {$gt: 1, $lt:2}},
//   ],
// ))


module.exports = {
  checkMatch,
  checkCondition,
  checkOne
}
