var data = {
  "_id": "86b2a5aa-6b0e-4043-8d8d-1f5f3fdb74b9",
  "goods": [{
      abc: {abc: 23},
      "person1": [{
          "item": "bb",
          "color": "1",
          "qty": 23
        },
        {
          "item": "bb",
          "color": "2",
          "qty": 23
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

_.visit(data, v=>{
  if(isParent(v.path)) {
    map.set(v.path, 0)
    return
  }
  for(const [key, val] of map) {
    if(isParentArray(v.path, key)) {
      map.set(key, val+1)
      console.log(v.path, map.get(key))
      return
    }
  }
  // console.log(v.path, v.key)
})

console.log([...map])

function isParent (path) {
  return path.length % 2 === 1
}

function isParentArray (subArr, parentArr) {
  return subArr.slice(0, -1).join() === parentArr.join()
}

