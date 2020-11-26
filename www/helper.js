function unixToYYYYMMDD(unixtime){
    var date = new Date(unixtime);
    var dd = date.getDate();
    var mm=date.getMonth()+1
    if(dd<10){dd='0'+dd} 
    if(mm<10){mm='0'+mm} 
    return date.getFullYear()+'-'+mm+'-'+dd;
}
function getHoursFromMidnight(){
    var date = new Date();
    return date.getUTCHours()+(date.getUTCMinutes()/60)+(date.getUTCSeconds()/3600)
}
function exportToCsv(table){
    var rows=Array.from(table.querySelectorAll("tr"))
    var longest= findLongestRowLength(rows)
    var lines=[]
    var linesString;
    for(var row of rows){
        var line=""
        for(var x=0;x<longest;x++){
            if(row.children[x]!=undefined){
                line+=parseCell(row.children[x])
            }
            line+=(x!=longest-1)?",":""
        }
        lines.push(line)
    }
    linesString=lines.join('\n')
    var csvBlob=new Blob([linesString],{type:'text/csv'})
    var blocUrl =URL.createObjectURL(csvBlob)
    console.log(blocUrl)
    var aElement=document.createElement('a')
    aElement.href=blocUrl
    aElement.download=table.id+'.csv'
    aElement.click()
    setTimeout(()=>{
        URL.revokeObjectURL(blocUrl)
    },500)
    }
    function findLongestRowLength(rows){
    var retNum=0
    for(x in rows){
        retNum=Math.max(rows[x].childElementCount,retNum)
    }
    return retNum
    }
    function parseCell(cell){
    var parsedValue=cell.textContent
    parsedValue=parsedValue.replace(/"/g,'""')
    parsedValue=/[",\n"]/.test(parsedValue)?`"${parsedValue}"`:parsedValue
    return parsedValue
    }
    



var lastElement={}
var lastBaseName={}
var inverSort={"deviceoverviewTable":false,"useroverviewTable":false}
var table, rows, sorting, i, x, y, shouldSwitch,sortIndex,dataType,sortLoopInterval;

function sortTable(table,sortIndex,isnumber,baseName,element) {  
    if(sorting){
        alert("Sort Error")
    }else{
        try{
            lastElement[table.id].innerHTML=lastBaseName[table.id]
        }catch (ignored) {}
        if(lastElement[table.id]==element){
            inverSort[table.id]=!inverSort[table.id]
        }
        lastElement[table.id]=element
        lastBaseName[table.id]=baseName

        element.innerHTML=baseName+(inverSort[table.id]?"\u25b2":"\u25bc")

        sorting = true;
        this.table=table
        this.sortIndex=sortIndex
        dataType=isnumber
        while(sorting){
        //sortLoopInterval=setInterval(sortLoop,0)
        sortLoop()
        }
    }
}
function sortLoop(){
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[sortIndex].innerHTML;
        y = rows[i + 1].getElementsByTagName("TD")[sortIndex].innerHTML;

        if(x.includes("$")){
            x=x.substr(1)
        }
        if(y.includes("$")){
            y=y.substr(1)
        }
        if(dataType==1){
            y=parseFloat(y)
            x=parseFloat(x)
        }else if (dataType==2){
            y=(new Date(y)).getTime()
            x=(new Date(x)).getTime()
        }else{
            x=x.toLowerCase()
            y=y.toLowerCase()
        }
        if ((x < y&&inverSort[table.id])||(x > y&&!inverSort[table.id])) {
            shouldSwitch = true;
            break;
        }
        
    }
    if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
    }else{
        // clearInterval(sortLoopInterval)
        sorting=false
    }
}