function $1(num, format) {
    // format: xxx,xxx.xx
    // xxx.??
    // ...?xx.x??
    num = +num;
    format = (format + "").toLowerCase();
    var openStart, openEnd, len = format.length, res;
    if (format.substring(0, 3) == "...") {
        openStart = true;
        format = format.substring(3);
        len -= 3;
    }
    if (format.substring(len - 3) == "...") {
        openEnd = true;
        len -= 3;
        format = format.substring(0, len);
    }
    if (~format.lastIndexOf(".")) {
        var dot = format.lastIndexOf("."),
            after = format.substring(dot + 1),
            before = format.substring(0, dot)
        
    } else {
        before = format;
        after = "";
    }
    if (!openEnd) {
        res = num.toFixed(after.length);
    } else {
        res = num + "";
    }
    res = res.substring(res.indexOf(".") + 1);
    for (var i = after.length; i--;) {
        switch (after.charAt(i)) {
            case "?":
                res.charAt(i) == "0"
            break;
        }
    }
}

