/* eslint-disable no-constant-condition */
var entityMap = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    '&quot;': '"',
    "&#x27;": "'",
    "&#x2F;": '/'
};

/**
 * Переведёт все html сущности в строке в символы
 * 
 * @param {String} string  было 
 * @returns {String}       стало
 */
function unescapeString(string) {
    if (typeof string === 'string') {
        return String(string).replace(/&quot;|&amp;|&lt;|&gt;|&#x27;|&#x2F;/g, function (s) {
            return entityMap[s];
        });
    }
    else return string
}

/**
 * Переведёт все html сущности полей объекта в спецсимволы
 * 
 * @param {Object} obj  Исходный объект 
 * @returns {Object}
 */
function unescapeOne(obj) {
    obj[Symbol.iterator] = function () {
        let i = 0,
            keys = [],
            values = []
        // if (obj._doc) {
            keys = Object.keys(obj._doc)
            values = Object.values(obj._doc)
        // }
        // else {
        //     keys = Object.keys(obj)
        //     values = Object.values(obj)
        // }
        return {
            next() {
                if (i < keys.length) {
                    return { done: false, value: values[i], key: keys[i++] }
                }
                return { done: true }
            }
        }
    }
    let iterator = obj[Symbol.iterator](),
        newObj = {}
    while (true) {
        let result = iterator.next()
        if (result.done) break
        // if (typeof result.value === 'object') {
        //     newObj[result.key] = unescapeOne(result.value)
        // }
        // else {
            newObj[result.key] = unescapeString(result.value)
        // }
    }
    return newObj
}

/**
 * Переведёт все html сущности полей каждого объекта в массиве в спецсимволы
 * 
 * @param {Array} arr  Исходный массив объектов 
 * @returns {Array}
 */
function unescapeMany(arr) {
    let escapedArr = []
    arr.forEach(element => {
        escapedArr.push(unescapeOne(element))
    })
    return escapedArr
}

module.exports = { unescapeOne, unescapeMany, unescapeString }