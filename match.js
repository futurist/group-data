var _ = require('objutil')

function checkMatch (checkObj, condition){
  return _.isIterable(checkObj)
    && _.isIterable(condition)
    && Object.keys(condition).every(
      v=>checkConditionObject(condition[v], checkObj[v], checkObj)
    )
}

console.log(checkMatch(null, {name:/o/, id:{$lt: 33}}) )

function checkConditionObject(cond, value, contextObj){
  if(_.isPrimitive(cond)) {
    return value === cond
  } else if (_.is(cond, 'RegExp')) {
    return cond.test(value)
  } else if (_.is(cond, 'Object')) {
    return Object.keys(cond).every(key=>
      checkConditionItem(key, cond[key], value, contextObj))
  } else if (Array.isArray(cond)) {
    return cond.some(v=>checkConditionObject(v, value))
  }
}

// It's one condition object item
// {$gt: 3}, left==$gt, right=3
// contextObj is the object provide the dot-path of relation of checkVal
// e.g. $gt: '$age', $age will be looked up in contextObj
function checkConditionItem(left, right, checkVal, contextObj) {
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
      && checkVal.some(v=>checkConditionObject(right, v, contextObj))

    case '$not': return !checkConditionObject(right, checkVal, contextObj)

    case '$or': return isArray(right)
      && checkConditionObject(right, checkVal, contextObj)

    case '$and': return isArray(right)
      && right.every(v=>checkConditionObject(v, checkVal, contextObj))

  }
}

// console.log(checkExclude({
//   $exclude: 23
// }, '23'))

// console.log(checkConditionItem('$elemMatch', 3,  [13, 2]))

// console.log(checkConditionObject(
//   [
//     {$not: {$gt: 1, $lt:2}},
//   ],
//   3
// ))


module.exports = checkMatch

