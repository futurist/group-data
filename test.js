import test from 'ava'
import lib from './'

test('example', t => {
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

var result = {
  abc: [
    {_id: {item: 'aa'}, sum: 45, count: 2},
    {_id: {item: 'bb'}, sum: 20, count: 1},
  ]
}

t.deepEqual(
  JSON.parse(JSON.stringify(lib(data, stage))),
  result
)

})

test('array data', t => {

  var data = [{
    'id': '86b2a5aa-6b0e-4043-8d8d-1f5f3fdb74b9',
    'type': 'form_aweawe',
    'bb': [{
      'bb': 'bb',
      'cc': [{
        'item': 'bb',
        'color': '3',
        'qty': 23
      }, {
        'item': 'bb',
        'color': '2',
        'qty': 23
      }, {
        'item': 'bb',
        'color': '3',
        'qty': 34
      }, {
        'item': 'aa',
        'color': '2',
        'qty': 54
      }]
    }, {
      'bb': 'aa',
      'cc': [{
        'item': 'aa',
        'color': '1',
        'qty': 23
      }, {
        'item': 'aa',
        'color': '2',
        'qty': 223
      }, {
        'item': 'aa',
        'color': '1',
        'qty': 32,
        x: {y: 1}
      }, {
        'item': 'aa',
        'color': '2',
        'qty': 23
      },
        {c: {d: 1}}
      ],
      c: {b: {d: 2}}
    }
    ]
  }, {
    bb: [
      {
        'bb': 'cc',
        'cc': [{
          'item': 'aa',
          'color': '1',
          'qty': 11
        }]
      }
    ]
  }]

  var stage = {
    $unwind: '$$.bb.$.cc.$',
    _id: {
      ITEM: '$$.bb.$.cc.$.item',
      COL: '$$.bb.$.cc.$.color'
    },
    // _id: null,
    min: {$min: '$$.bb.$.cc.$.qty'},
    max: {$max: '$$.bb.$.cc.$.qty'},
    avg: {$avg: '$$.bb.$.cc.$.qty'},
    sum: {$sum: '$$.bb.$.cc.$.qty'},
    first: {$first: '$$.bb.$.cc.$.qty'},
    last: {$last: '$$.bb.$.cc.$.qty'},
    // count: {$sum: 1},
    count: {$sum: 1, $ensure: ['$$.bb.$.cc.$.qty']},
    bbItem: {$push: '$$.bb.$.bb'},
    bbItemSet: {$addToSet: '$$.bb.$.bb'}
  }

  var result = {
    '': [
      {
        '_id': {
          'ITEM': 'bb',
          'COL': '3'
        },
        'min': 23,
        'max': 34,
        'avg': 28.5,
        'sum': 57,
        'first': 23,
        'last': 34,
        'count': 2,
        'bbItem': [
          'bb',
          'bb'
        ],
        'bbItemSet': [
          'bb'
        ]
      },
      {
        '_id': {
          'ITEM': 'bb',
          'COL': '2'
        },
        'min': 23,
        'max': 23,
        'avg': 23,
        'sum': 23,
        'first': 23,
        'last': 23,
        'count': 1,
        'bbItem': [
          'bb'
        ],
        'bbItemSet': [
          'bb'
        ]
      },
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '2'
        },
        'min': 23,
        'max': 223,
        'avg': 100,
        'sum': 300,
        'first': 54,
        'last': 23,
        'count': 3,
        'bbItem': [
          'bb',
          'aa',
          'aa'
        ],
        'bbItemSet': [
          'bb',
          'aa'
        ]
      },
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '1'
        },
        'min': 11,
        'max': 32,
        'avg': 22,
        'sum': 66,
        'first': 23,
        'last': 11,
        'count': 3,
        'bbItem': [
          'aa',
          'aa',
          'cc'
        ],
        'bbItemSet': [
          'aa',
          'cc'
        ]
      }
    ],
    '0.bb': [
      {
        '_id': {
          'ITEM': 'bb',
          'COL': '3'
        },
        'min': 23,
        'max': 34,
        'avg': 28.5,
        'sum': 57,
        'first': 23,
        'last': 34,
        'count': 2,
        'bbItem': [
          'bb',
          'bb'
        ],
        'bbItemSet': [
          'bb'
        ]
      },
      {
        '_id': {
          'ITEM': 'bb',
          'COL': '2'
        },
        'min': 23,
        'max': 23,
        'avg': 23,
        'sum': 23,
        'first': 23,
        'last': 23,
        'count': 1,
        'bbItem': [
          'bb'
        ],
        'bbItemSet': [
          'bb'
        ]
      },
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '2'
        },
        'min': 23,
        'max': 223,
        'avg': 100,
        'sum': 300,
        'first': 54,
        'last': 23,
        'count': 3,
        'bbItem': [
          'bb',
          'aa',
          'aa'
        ],
        'bbItemSet': [
          'bb',
          'aa'
        ]
      },
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '1'
        },
        'min': 23,
        'max': 32,
        'avg': 27.5,
        'sum': 55,
        'first': 23,
        'last': 32,
        'count': 2,
        'bbItem': [
          'aa',
          'aa'
        ],
        'bbItemSet': [
          'aa'
        ]
      }
    ],
    '0.bb.0.cc': [
      {
        '_id': {
          'ITEM': 'bb',
          'COL': '3'
        },
        'min': 23,
        'max': 34,
        'avg': 28.5,
        'sum': 57,
        'first': 23,
        'last': 34,
        'count': 2,
        'bbItem': [
          'bb',
          'bb'
        ],
        'bbItemSet': [
          'bb'
        ]
      },
      {
        '_id': {
          'ITEM': 'bb',
          'COL': '2'
        },
        'min': 23,
        'max': 23,
        'avg': 23,
        'sum': 23,
        'first': 23,
        'last': 23,
        'count': 1,
        'bbItem': [
          'bb'
        ],
        'bbItemSet': [
          'bb'
        ]
      },
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '2'
        },
        'min': 54,
        'max': 54,
        'avg': 54,
        'sum': 54,
        'first': 54,
        'last': 54,
        'count': 1,
        'bbItem': [
          'bb'
        ],
        'bbItemSet': [
          'bb'
        ]
      }
    ],
    '0.bb.1.cc': [
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '1'
        },
        'min': 23,
        'max': 32,
        'avg': 27.5,
        'sum': 55,
        'first': 23,
        'last': 32,
        'count': 2,
        'bbItem': [
          'aa',
          'aa'
        ],
        'bbItemSet': [
          'aa'
        ]
      },
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '2'
        },
        'min': 23,
        'max': 223,
        'avg': 123,
        'sum': 246,
        'first': 223,
        'last': 23,
        'count': 2,
        'bbItem': [
          'aa',
          'aa'
        ],
        'bbItemSet': [
          'aa'
        ]
      }
    ],
    '1.bb': [
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '1'
        },
        'min': 11,
        'max': 11,
        'avg': 11,
        'sum': 11,
        'first': 11,
        'last': 11,
        'count': 1,
        'bbItem': [
          'cc'
        ],
        'bbItemSet': [
          'cc'
        ]
      }
    ],
    '1.bb.0.cc': [
      {
        '_id': {
          'ITEM': 'aa',
          'COL': '1'
        },
        'min': 11,
        'max': 11,
        'avg': 11,
        'sum': 11,
        'first': 11,
        'last': 11,
        'count': 1,
        'bbItem': [
          'cc'
        ],
        'bbItemSet': [
          'cc'
        ]
      }
    ]
  }

  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage))),
    result
  )
})

test('object data', t => {
  var data = [{a: {b: 2}, c: 3, d: 4}]
  var stage = {
    $unwind: '$$',
    _id: {c: '$$.c', abc: '$$.a.b'},
    count: {$sum: 1.5}
  }
  var result = {
    '': [
      {
        '_id': {
          abc: 2,
          c: 3
        },
        'count': 1.5
      }
    ]
  }

  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage))),
    result
  )
})

test('count $sum with float', t => {
  var data = [{a: 1}, {a: 1}]
  var stage = {
    $unwind: '$$',
    _id: {c: '$$.a'},
    count: {$sum: 1.5}
  }
  var result = {
    '': [{
      _id: {c: 1},
      count: 3
    }]
  }

  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage))),
    result
  )
})

test('data', t => {
  var data = {
    '_id': '86b2a5aa-6b0e-4043-8d8d-1f5f3fdb74b9',
    'goods': [
      {
        'person': [{
          'item': 'bb',
          'color': '1',
          'qty': 23
        }]
      },
      {
        abc: {abc: 23},
        'person': [{
          'item': 'bb',
          'color': '1',
          'qty': 23
        },
          {
            'item': 'bb',
            'color': '2',
            'qty': 24
          },
          {
            'item': 'bb',
            'color': '1',
            'qty': 34
          },
          {
            'item': 'aa',
            'color': '2',
            'qty': 54
          }
        ]
      },
      {
        'person': [{
          'item': 'aa',
          'color': '1',
          'qty': 23
        },
          {
            'item': 'aa',
            'color': '2',
            'qty': 223
          },
          {
            'item': 'aa',
            'color': '1',
            'qty': 32
          },
          {
            'item': 'aa',
            'color': '2',
            'qty': 23
          }
        ]
      }
    ]
  }

  var stage = {
    $unwind: '$goods.$.person.$',
    _id: {
      ITEM: '$goods.$.person.$.item',
      COL: '$goods.$.person.$.color'
    },
    sum: {$sum: '$goods.$.person.$.qty'}
  }
  var result = {"goods":[{"_id":{"ITEM":"bb","COL":"1"},"sum":80},{"_id":{"ITEM":"bb","COL":"2"},"sum":24},{"_id":{"ITEM":"aa","COL":"2"},"sum":300},{"_id":{"ITEM":"aa","COL":"1"},"sum":55}],"goods.0.person":[{"_id":{"ITEM":"bb","COL":"1"},"sum":23}],"goods.1.person":[{"_id":{"ITEM":"bb","COL":"1"},"sum":57},{"_id":{"ITEM":"bb","COL":"2"},"sum":24},{"_id":{"ITEM":"aa","COL":"2"},"sum":54}],"goods.2.person":[{"_id":{"ITEM":"aa","COL":"1"},"sum":55},{"_id":{"ITEM":"aa","COL":"2"},"sum":246}]}

  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage))),
    result
  )
  // console.log(JSON.stringify(lib(data, stage)))
})


test('$exclude', t=>{
  var data = [
    {name: 1, qty: 10},
    {name: 2, qty: 20},
    {name: 1, qty: 30},
  ]
  var stage = {
    $exclude: {$test: {name: 2}},
    $unwind: '$$',
    _id: {
      name: '$$.name'
    },
    sum: {$sum: '$$.qty'}
  }
  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage, {
      onExclude: v=>t.deepEqual(v, { name: 2, qty: 20 })
    }))),
    {
      '':[
        {_id: {name: 1}, sum: 40}
      ]
    }
  )
})


test('$include', t=>{
  var data = [
    {name: 1, qty: 10},
    {name: 2, qty: 20},
    {name: 1, qty: 30},
  ]
  var stage = {
    $exclude: {$test: 'non-object should be ignored'},
    $include: {$test: {name: 2}},
    $unwind: '$$',
    _id: {
      name: '$$.name'
    },
    sum: {$sum: '$$.qty'}
  }
  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage, {
      onInclude: v=>t.deepEqual(v, { name: 2, qty: 20 })
    }))),
    {
      '':[
        {_id: {name: 2}, sum: 20}
      ]
    }
  )
})


test('$include and $exclude', t=>{
  var data = [
    {name: 1, qty: 10},
    {name: 2, qty: 20},
    {name: 1, qty: 30},
  ]
  var stage = {
    $exclude: {
      // $path: '$$', // current path can be ignored
      $test: {name: 2}
    },
    $include: {$test: {qty: 10}},
    $unwind: '$$',
    _id: {
      name: '$$.name'
    },
    sum: {$sum: '$$.qty'}
  }
  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage, {
      onExclude: v=>{
        // console.log(v)
        t.deepEqual(v, { name: 2, qty: 20 })
      }
    }))),
    {
      '':[
        {_id: {name: 1}, sum: 10}
      ]
    }
  )
})


test('$values without $keys', t=>{
  var data = {
    a:[
      {id: 1, name:'a', b:{c:2}},
      {id: 2, name:'a', b:{c:3}},
      {id: 3, name:'a', b:{c:15}},
    ]
  }
  var stage={
    $unwind: '$a.$.b.c',
    $exclude: {
      $values: 2
    },
    _id:null,
    count: {$sum: 1}
  }
  const matchKey=['c', 'id']
  const matchPKey=['b', '1']
  const matchCol = [
    { c: 2 },
    { id: 2, name: 'a', b: { c: 3 } }
  ]
  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage, {
      onExclude: (col, pkey, path, key)=>{
        t.deepEqual(key, matchKey.shift())
        t.deepEqual(pkey, matchPKey.shift())
        t.deepEqual(col, matchCol.shift())
      }
    }))),
    {
      a: [
        {
        _id:{},
        count: 1
      }]}
  )
})



test('$values with $keys', t=>{
  var data = {
    a:[
      {id: 1, name:'a', b:{c:2}},
      {id: 2, name:'a', b:{c:3}},
      {id: 3, name:'a', b:{c:15}},
    ]
  }
  var stage={
    $unwind: '$a.$.b.c',
    $exclude: {
      $keys: /d/, // or 'id'
      $values: 2
    },
    _id:null,
    count: {$sum: 1}
  }
  const matchKey=['id']
  const matchPKey=['1']
  const matchCol = [
    { id: 2, name: 'a', b: { c: 3 } },
  ]
  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage, {
      onExclude: (col, pkey, path, key)=>{
        // console.log(path)
        t.deepEqual(key, matchKey.shift())
        t.deepEqual(pkey, matchPKey.shift())
        t.deepEqual(col, matchCol.shift())
      }
    }))),
    {
      a: [
        {
        _id:{},
        count: 2
      }]}
  )
})


test('array of $exclude', t=>{
  var data = {
    a:[
      {id: 1, name:'a', b:{c:2}},
      {id: 2, name:'a', b:{c:3}},
      {id: 3, name:'a', b:{c:15}},
    ]
  }
  var stage={
    $unwind: '$a.$.b.c',
    $exclude: [
      {
        $keys: 'id',
        $values: 2
      },
      {
        $path: /./,
        $test: {c: 15}
      }
    ],
    _id:null,
    count: {$sum: 1}
  }
  const matchKey=['id', undefined]
  const matchPKey=['1', 'b']
  const matchCol = [
    { id: 2, name: 'a', b: { c: 3 } },
    { c: 15 },
  ]
  t.deepEqual(
    JSON.parse(JSON.stringify(lib(data, stage, {
      onExclude: (col, pkey, path, key)=>{
        t.deepEqual(key, matchKey.shift())
        t.deepEqual(pkey, matchPKey.shift())
        t.deepEqual(col, matchCol.shift())
      }
    }))),
    {
      a: [
        {
        _id:{},
        count: 1
      }]}
  )
})


