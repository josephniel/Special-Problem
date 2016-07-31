function equal_arrays(a, b) {
    if (!a instanceof Array || !b instanceof Array)
        throw new TypeError("Expecting Array arguments");

    if (a.length != b.length)
        return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] != b[i])
            return false;
    }

    return true;
}

function base64Encode(arr) {
    var str = "";
    if (arr instanceof Array) {
        for (var i = 0; i < arr.length / 100; ++i)
            str += String.fromCharCode.apply(null, arr.slice(i * 100, i * 100 + 100));
    } else if (arr.buffer instanceof ArrayBuffer) {
        for (var j = 0; j < arr.length / 100; ++j)
            str += String.fromCharCode.apply(null, new Uint8Array(arr.buffer,
                                                                  j * 100,
                                                                  Math.min(arr.buffer.byteLength - j * 100, 100)));
    } else {
        throw new TypeError("Expecting an array or typed array argument.");
    }
    return btoa(str);
}

function base64Decode(b64) {
    return new Uint8Array(atob(b64).split("").map(function(c) { return c.charCodeAt(0); }));
}

function serialize(val, i) {
    if (typeof val == "string") {
        return { type: "string", typesize: val.length, value: btoa(val), le: true };
    } else if (val instanceof sm.types.base.Base) {
        return { type: val.typename, typesize: val.typesize, value: base64Encode(val.toBytes()), le: val.le };
    } else if (val instanceof sm.types.base.PdBase) {
        return { pd: val.pdname, type: val.typename, typesize: val.typesize, value: base64Encode(val.toBytes(i)), le: val.le[i] };
    } else {
        throw new TypeError("Not a sharemind type");
    }
}

function deserialize() {
    if (arguments.length < 1)
        throw new Error("At least one argument expected");

    var pd = [];
    var type = [];
    var value = [];
    var le = [];

    // Check if the input values have all the necessary pieces
    for (var i = 0; i < arguments.length; ++i) {
        if (arguments[i] === undefined || arguments[i] === null)
            throw new TypeError("Invalid argument");

        pd.push(arguments[i].pd);
        if (arguments[i].type === undefined || arguments[i].type === null)
            throw new Error("Missing value type identifier");
        type.push(arguments[i].type);
        if (arguments[i].type == "string" && typeof arguments[i].value == "string") {
            value.push(atob(arguments[i].value));
        } else {
            if (typeof arguments[i].value == "string")
                value.push(base64Decode(arguments[i].value));
            else
                value.push(arguments[i].value);
        }
        le.push(arguments[i].le === undefined || arguments[i].le === null ? true : arguments[i].le);
    }

    // Check if the inputs agree on some values
    for (var j = 1; j < arguments.length; ++j) {
        if (pd[0] != pd[j])
            throw new Error("Got mismatching protection domain identifiers");
        if (type[0] != type[j])
            throw new Error("Got mismatching value type identifiers");
    }

    // Deserialize the values
    if (pd[0] === undefined || pd[0] === null) {
        // Public value

        smbase = sm.types.base;

        // Validate that every node sent the same value
        // TODO endian aware comparison
        for (var k = 1; k < arguments.length; ++k) {
            if (!equal_arrays(value[0], value[k]))
                throw new Error("Got mismatching public value");
        }

        if (type[0] == "string") {
            if (typeof value[0] == "string") {
                return value[0];
            } else {
                throw new TypeError("String value expected");
            }
        }

        if (type[0] == smbase.BoolArray.typename)
            return new smbase.BoolArray(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Int8Array.typename)
            return new smbase.Int8Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Int16Array.typename)
            return new smbase.Int16Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Int32Array.typename)
            return new smbase.Int32Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Int64Array.typename)
            return new smbase.Int64Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Uint8Array.typename)
            return new smbase.Uint8Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Uint16Array.typename)
            return new smbase.Uint16Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Uint32Array.typename)
            return new smbase.Uint32Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Uint64Array.typename)
            return new smbase.Uint64Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Float32Array.typename)
            return new smbase.Float32Array(new Uint8Array(value[0]).buffer, le[0]);
        else if (type[0] == smbase.Float64Array.typename)
            return new smbase.Float64Array(new Uint8Array(value[0]).buffer, le[0]);
        else
            throw new TypeError("Unknown value type: \"" + type[0] + "\"");
    } else if (pd[0] == sm.types.shared3p.Base.pdname) {
        // Protection domain value

        var buffers = new Array(value.length);
        for (var l = 0; l < value.length; ++l)
            buffers[l] = new Uint8Array(value[l]).buffer;

        smshared3p = sm.types.shared3p;

        if (type[0] == smshared3p.BoolArray.typename)
            return new smshared3p.BoolArray(buffers, le);
        else if (type[0] == smshared3p.Int8Array.typename)
            return new smshared3p.Int8Array(buffers, le);
        else if (type[0] == smshared3p.Int16Array.typename)
            return new smshared3p.Int16Array(buffers, le);
        else if (type[0] == smshared3p.Int32Array.typename)
            return new smshared3p.Int32Array(buffers, le);
        else if (type[0] == smshared3p.Int64Array.typename)
            return new smshared3p.Int64Array(buffers, le);
        else if (type[0] == smshared3p.Uint8Array.typename)
            return new smshared3p.Uint8Array(buffers, le);
        else if (type[0] == smshared3p.Uint16Array.typename)
            return new smshared3p.Uint16Array(buffers, le);
        else if (type[0] == smshared3p.Uint32Array.typename)
            return new smshared3p.Uint32Array(buffers, le);
        else if (type[0] == smshared3p.Uint64Array.typename)
            return new smshared3p.Uint64Array(buffers, le);
        else if (type[0] == smshared3p.Float32Array.typename)
            return new smshared3p.Float32Array(buffers, le);
        else if (type[0] == smshared3p.Float64Array.typename)
            return new smshared3p.Float64Array(buffers, le);
        else if (type[0] == smshared3p.XorUint8Array.typename)
            return new smshared3p.XorUint8Array(buffers, le);
        else if (type[0] == smshared3p.XorUint16Array.typename)
            return new smshared3p.XorUint16Array(buffers, le);
        else if (type[0] == smshared3p.XorUint32Array.typename)
            return new smshared3p.XorUint32Array(buffers, le);
        else if (type[0] == smshared3p.XorUint64Array.typename)
            return new smshared3p.XorUint64Array(buffers, le);
        else
            throw new TypeError("Unknown value type: \"" + type[0] + "\" in protection domain \"" + pd[0] + "\"");
    } else {
        throw new Error("Unknown protection domain: \"" + pd[0] + "\"");
    }
}

function init() {

    // Set a global PRNG for secret sharing
    sm.types.prng = new PRNG([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);

    // Input, with base64 encoded byte arrays
    var input = [
    {
        "pd_shared3p::int32":{"type":"int32","pd":"pd_shared3p","value":"5HKRiD1Cn8bct/35bD5cBTXc54c1sVU5i68v+ekZfAwVHcggThbfNg=="},
        "public::int32":{"type":"int32","value":"+/////z////9/////v////////8AAAAAAQAAAAIAAAADAAAABAAAAA=="}
    },
    {
        "pd_shared3p::int32":{"type":"int32","pd":"pd_shared3p","value":"8h8YixNpcsfjeviUznsVlVbuqpDDZkfYIWYh6+VwFvaZpmdAksC+Og=="},
        "public::int32":{"type":"int32","value":"+/////z////9/////v////////8AAAAAAQAAAAIAAAADAAAABAAAAA=="}
    },
    {
        "pd_shared3p::int32":{"type":"int32","pd":"pd_shared3p","value":"JW1W7KxU7nE+zQlxxEWOZXQ1becI6GLuVequGzR1bf1VPNCeJClijg=="},
        "public::int32":{"type":"int32","value":"+/////z////9/////v////////8AAAAAAQAAAAIAAAADAAAABAAAAA=="}
    }];

    console.log("Input: " + JSON.stringify(input));

    // Deserialize the values
    var values = {};

    for (var name in input[0]) {
        try {
            values[name] = deserialize(input[0][name], input[1][name], input[2][name]);
        } catch (err) {
            console.log("Error while deserializing value '" + name + "': " + err.message);
        }
    }

    // Print the values
    try {
        for (var name1 in values) {
            var val = values[name1];
            for (var i = 0; i < val.length; ++i)
                console.log("'" + name1 + "'[" + i + "]: " + val.get(i));
        }
    } catch (err) {
        console.log("Error while printing values: " + err.message);
    }

    // Serialize the values
    var output = [{}, {}, {}];

    for (var j = 0; j < 3; ++j) {
        for (var name2 in values) {
            try {
                output[j][name2] = serialize(values[name2], j);
            } catch (err) {
                console.log("Error while serializing value '" + name2 + "': " + err.message);
            }
        }
    }

    console.log("Output: " + JSON.stringify(output));

    console.log("All done!");
}
