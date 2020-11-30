var idMap = {};
var userDevices = {};
var userData = {};
var sevenDay = 7 * 24 * 60 * 60;
var oneDay = 1 * 24 * 60 * 60;
var last7Total = 0;
var nowReceived = false;
var balUSD;
var balRealtime
var sidebarWidth = 0;
var last7initial = {};
var deviceBalance = {};
var deviceOverviewInitial;
var startDateVal;
var endDateVal;
var transactions;

startDateTrans.max = unixToYYYYMMDD(new Date().getTime());
startDateTrans.value = unixToYYYYMMDD(new Date().getTime() - sevenDay * 1000);
endDateTrans.max = unixToYYYYMMDD(new Date().getTime() + oneDay * 1000);
endDateTrans.value = unixToYYYYMMDD(new Date().getTime() + oneDay * 1000);
for (var x = 0; x < 2; x++) {
  startDate[x].max = unixToYYYYMMDD(new Date().getTime());
  startDate[x].value = unixToYYYYMMDD(new Date().getTime() - sevenDay * 1000);
  endDate[x].max = unixToYYYYMMDD(new Date().getTime() + oneDay * 1000);
  endDate[x].value = unixToYYYYMMDD(new Date().getTime() + oneDay * 1000);
}

refresh();
onDateChangeTrans(startDateTrans.value, endDateTrans.value);

setInterval(refresh, 300000);

function refresh() {
	getData({ action: "getbalance", echo: "balance" });
	getData({ action: "getstarttime", echo: "starttime" });
	getData({ action: "getidmap", echo: "idmap" });
}

function updateTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return " &bull; Last updated " + strTime;
}

function parseRes(res) {
  jsonData = JSON.parse(res);
  if (jsonData.echo == "balance") {
    if (
      jsonData.req.data.payout != undefined) {
      balCredits=jsonData.req.data.payout.credits
      currentBalance.innerHTML = jsonData.req.data.payout.credits;
      currentBalanceUSD.innerText =
        "$" + jsonData.req.data.payout.usd_cents / 100;
      balUSD = jsonData.req.data.payout.usd_cents / 100;
      calcNextPayout();
      balRealtime=jsonData.req.data.realtime.credits
      toDayBalance.innerHTML=balRealtime.toFixed(2);
      toDayBalanceUSD.innerHTML='$'+(balRealtime/1000).toFixed(2)
      getData({ action: "getlastbalance", echo: "lastbalance" });
	  document.getElementById("updateInfo").innerHTML = updateTime(new Date);
    }
  }
  if(jsonData.echo=="lastbalance"){
    var diffBal=balRealtime-jsonData.req.data.realtime.credits
    var diffBal2=jsonData.req.data.realtime.credits-jsonData.req2.data.realtime.credits

    if(diffBal<0){
      diffBal=balRealtime
    }
    if(diffBal2<0){
      diffBal2=balRealtime
    }
    toHourBalanceUSD.innerText='$'+(diffBal/1000).toFixed(2)
    toHourBalance.innerHTML=diffBal.toFixed(2);
    lastHourBalanceUSD.innerText='$'+(diffBal2/1000).toFixed(2)
    lastHourBalance.innerHTML=diffBal2.toFixed(2);
    lastHourRate.innerHTML='$'+(diffBal2/1000*24).toFixed(2)+'<font size="5">/day</font>';
  }
  if (jsonData.echo == "sevenday") {
    last7initial = jsonData.balance;
    getData({ action: "getdevicebalance", time: "now", echo: "now" });
  }
  if (jsonData.echo == "enddate") {
    deviceBalanceEnd = jsonData.balance;
    getData({
      action: "getdevicebalance",
      starttime: new Date(startDateVal).getTime() / 1000,
      echo: "deviceoverview",
    });
  }
  if (jsonData.echo == "now") {
    deviceBalance = jsonData.balance;
	last7Total = 0;
    nowReceived = true;
    for (x in last7initial) {
      last7Total += deviceBalance[x].credits - last7initial[x];
      last7Balance.innerHTML = last7Total.toFixed(2);
      last7BalanceUSD.innerText = "$" + (last7Total / 1000).toFixed(2);
      //last7BalanceGB.innerText = (last7Total / 100).toFixed(2);
      last7Rate.innerText = "$" + (last7Total / 1000 / 7).toFixed(2);
    }
  }
  if (jsonData.echo == "deviceoverview") {
    deviceOverviewInitial = jsonData.balance;
    updateTables();
  }
  if (jsonData.echo == "starttime") {
    startDate[0].min = unixToYYYYMMDD(jsonData.time * 1000);
    startDate[1].min = unixToYYYYMMDD(jsonData.time * 1000);
    endDate[0].min = unixToYYYYMMDD(jsonData.time * 1000);
    endDate[1].min = unixToYYYYMMDD(jsonData.time * 1000);
  }
  if (jsonData.echo == "idmap") {
    idMap = jsonData.idmap;
    getData({
      action: "getdevicebalance",
      starttime: new Date().getTime() / 1000 - sevenDay,
      echo: "sevenday",
    });
  }
  if (jsonData.echo == "transactions") {
    transactions = jsonData.transactions;
    updateTransactionTable();
  }
  console.log("message: ", jsonData);
}
function updateTransactionTable() {
  var gatheredAmountNum = 0;
  var referralAmountNum = 0;
  var winningAmountNum = 0;
  var payoutAmountNum = 0;
  var len = transactionOverviewTable.rows.length - 1;
  for (var x = 0; x < len; x++) {
    transactionOverviewTable.deleteRow(1);
  }
  for (var transaction of transactions) {
    var transactionRow = transactionOverviewTable.insertRow(1);
    var typeMap = {
      traffic_earnings: { displayName: "Traffic Earnings", show: [1, 1, 0, 0, 0] },
	  earnings: { displayName: "Traffic Earnings", show: [1, 1, 0, 0, 0] },
	  cdn_earnings: { displayName: "Content Delivery", show: [1, 1, 0, 0, 0] },
      payout_reservation: {
        displayName: "Payout Reservation",
        show: [1, 0, 1, 0, 0],
      },
      payout: { displayName: "Payout", show: [1, 0, 1, 0, 0] },
      payout_reservation_return: {
        displayName: "Payout Reservation Return",
        show: [1, 0, 1, 0, 0],
      },
      coupon: { displayName: "Coupon", show: [1, 0, 0, 1, 0] },
	  winning: { displayName: "Honey Jar", show: [1, 0, 0, 1, 0] },
      referral: { displayName: "Referral", show: [1, 0, 0, 0, 1] },
    };

    transactionRow.transaction = transaction;
    transactionRow.onclick = function () {
      showTransactionDetails(this.transaction);
    };
    transactionRow.insertCell(0).innerText = typeMap[transaction.type]
      ? typeMap[transaction.type].displayName
      : transaction.type;
    if (typeMap[transaction.type]) {
      transactionRow.style =
        typeMap[transaction.type].show[transactionsDisplayMode.selectedIndex] ==
        0
          ? "display:none;"
          : "";
    }
    transactionRow.insertCell(1).innerText = transaction.amount_credits;
    transactionRow.insertCell(2).innerText =
      "$" + (transaction.amount_usd_cents / 100).toFixed(2);

    if (transaction.type == "earnings" || transaction.type == "traffic_earnings" || transaction.type == "cdn_earnings") {
      gatheredAmountNum = (
        parseFloat(gatheredAmountNum) +
        parseFloat(transaction.amount_usd_cents) / 100
      ).toFixed(2);
    }
	if (transaction.type == "referral") {
      referralAmountNum = (
        parseFloat(referralAmountNum) +
        parseFloat(transaction.amount_usd_cents) / 100
      ).toFixed(2);
    }
	if (transaction.type == "winning") {
      winningAmountNum = (
        parseFloat(winningAmountNum) +
        parseFloat(transaction.amount_usd_cents) / 100
      ).toFixed(2);
    }
    if (
      transaction.type == "payout_reservation" ||
      transaction.type == "payout" ||
      transaction.type == "payout_reservation_return"
    ) {
      payoutAmountNum = (
        parseFloat(payoutAmountNum) +
        parseFloat(transaction.amount_usd_cents) / 100
      ).toFixed(2);
    }
    transactionRow.insertCell(3).innerText = transaction.created_at;
  }
  gatheredAmount.innerText = "$" + gatheredAmountNum;
  referralAmount.innerText = "$" + referralAmountNum;
  winningAmount.innerText = "$" + winningAmountNum;
  payoutAmount.innerText = "$" + Math.abs(payoutAmountNum);
}
function showTransactionDetails() {}
function updateTables() {
  userDevices = {};
  userData = {};
  var hgactiveDevicesNum = 0;
  var activeDevicesNum = 0;
  var earningDevicesNum = 0;
  var earningsTotal = 0;
  var len = deviceoverviewTable.rows.length - 1;
  var len2 = useroverviewTable.rows.length - 1;
  for (var x = 0; x < len; x++) {
    deviceoverviewTable.deleteRow(1);
  }
  for (var x = 0; x < len2; x++) {
    useroverviewTable.deleteRow(1);
  }
  var rowCount = 0;
  for (var id in deviceOverviewInitial) {
    rowCount++;
    var earningDevice = false;
    hgactiveDevicesNum++;
    try {
      last7Total += deviceBalanceEnd[id].credits - deviceOverviewInitial[id];
    } catch (e) {
      deviceBalanceEnd[id] = { credits: deviceOverviewInitial[id] };
    }
    //device earning
    if (deviceBalanceEnd[id].credits != deviceOverviewInitial[id]) {
      earningsTotal += deviceBalanceEnd[id].credits - deviceOverviewInitial[id];
      earningDevicesNum++;
      earningDevice = true;
    }

    var username = id;
    if (idMap[id] != undefined) {
      username = decodeURI(idMap[id].title);
    }
    var deviceRow = deviceoverviewTable.insertRow(rowCount);

    var userCell = deviceRow.insertCell(0);
    userCell.innerText = username;


    var creditsGainedCell = deviceRow.insertCell(1);
    creditsGainedCell.innerText = (
      deviceBalanceEnd[id].credits - deviceOverviewInitial[id]
    ).toFixed(1);

    var totalCreditsCell = deviceRow.insertCell(2);
    totalCreditsCell.innerText = deviceBalanceEnd[id].credits.toFixed(2);

    var balanceGainedCell = deviceRow.insertCell(3);
    balanceGainedCell.innerText =
      "$" +
      (
        (deviceBalanceEnd[id].credits - deviceOverviewInitial[id]) /
        1000
      ).toFixed(2);

    var totalBalanceCell = deviceRow.insertCell(4);
    totalBalanceCell.innerText =
      "$" + (deviceBalanceEnd[id].credits / 1000).toFixed(2);

    var lastEarningCell = deviceRow.insertCell(5);

    var tSplit = username.split("*");
    var thisLastEarning = (
      (new Date().getTime() / 1000 - deviceBalance[id].lastEarning) /
      3600
    ).toFixed(1);

    if (tSplit[0].charAt(0) == "#" && tSplit.length == 3) {
      //follows the pool format: #<user>*<device>*
      username = tSplit[0].substr(1);
      userCell.innerText = username;
      deviceCell.innerText = tSplit[1];
      if (userDevices[username] == undefined) {
        //create user
        userDevices[username] = [];
        userData[username] = {
          deviceCount: 0,
          earningDeviceCount: 0,
          activeDeviceCount: 0,
          creditsEarned: 0,
          totalCredits: 0,
        };
      }
      //update user stats
      userData[username].deviceCount++;
      userData[username].earningDeviceCount += earningDevice ? 1 : 0;
      userData[username].creditsEarned =
        deviceBalanceEnd[id].credits -
        deviceOverviewInitial[id] +
        parseFloat(userData[tSplit[0].substr(1)].creditsEarned);
      userData[username].totalCredits += deviceBalanceEnd[id].credits;
      userData[username].activeDeviceCount += thisLastEarning >= 24 ? 0 : 1;
      userDevices[username].push({
        //push device into user
        id: id,
        device: tSplit[1],
        creditsEarned: (
          deviceBalanceEnd[id] - deviceOverviewInitial[id]
        ).toFixed(2),
        totalCredits: deviceBalanceEnd[id],
      });
    } //end follows the pool format: #<user>*<device>*
    lastEarningCell.innerText = thisLastEarning + "h ago";
    lastEarningCell.style =
      thisLastEarning >= 24 ? "color: #ff0000;" : "";
    //display mode hide not earning
    if (
      deviceDisplayMode.selectedIndex == 3 &&
      (deviceBalanceEnd[id].credits - deviceOverviewInitial[id]).toFixed(2) == 0
    ) {
      deviceRow.style = "display:none;";
    }
    //device inactive
    if (thisLastEarning >= 24) {
      if (deviceDisplayMode.selectedIndex == 1) {
        //display mode hide inactive
        deviceRow.style = "display:none;";
      }
    } else {
      if (deviceDisplayMode.selectedIndex == 2) {
        //display mode only show inactive
        deviceRow.style = "display:none;";
      }
      activeDevicesNum++;
    }
  }

  //overview card
  earningPerDevice.innerText = "$" + (
    earningsTotal /
    earningDevicesNum /
    1000
  ).toFixed(2);
  activeDevices.innerText = activeDevicesNum + "/" + hgactiveDevicesNum;
  earningDevices.innerText = earningDevicesNum + "/" + hgactiveDevicesNum;

  var earningUserNum = 0;
  var hgActiveUsersNum = 0;
  //overview card
  earningUsers.innerText = earningUserNum;
  earningPerUser.innerText = (earningsTotal / earningUserNum / 1000).toFixed(3);
  sortTable(
    deviceoverviewTable,
    5,
    true,
    "Active",
    devicesActive
  );
  sortTable(useroverviewTable, 4, true, "Cr+", userCreditsGained);
}
function calcNextPayout() {
  if (balUSD != undefined && nowReceived) {
    nextPayout.innerHTML= Math.max(
      ((7 / (last7Total / 1000)) * (20 - balUSD)).toFixed(0)
    )+'<font size="5"> Days</font>';
    startDate[0].onchange();
  }
}

window.onhashchange = function () {
  switch (document.location.hash.replace("#", "").split("?")[0]) {
    case "dash":
      overviewPage.style.display = "inline-block";
      devicesPage.style.display = "none";
      usersPage.style.display = "none";
      transactionPage.style.display = "none";
      pagelable.innerText = "Dashboard";
	  dashboardBtn.classList.add('active');
	  devicesBtn.classList.remove('active');
	  transactionsBtn.classList.remove('active');
      break;
    case "devices":
      overviewPage.style.display = "none";
      devicesPage.style.display = "inline-block";
      usersPage.style.display = "none";
      transactionPage.style.display = "none";
      pagelable.innerText = "Devices";
	  dashboardBtn.classList.remove('active');
	  devicesBtn.classList.add('active');
	  transactionsBtn.classList.remove('active');
      break;
    case "transactions":
      overviewPage.style.display = "none";
      devicesPage.style.display = "none";
      usersPage.style.display = "none";
      transactionPage.style.display = "inline-block";
      pagelable.innerText = "Transactions";
	  dashboardBtn.classList.remove('active');
	  devicesBtn.classList.remove('active');
	  transactionsBtn.classList.add('active');
      break;
    default:
      document.location.hash = "dash";
      break;
  }
};

function onDateChange(sdate, edate) {
  startDateVal = sdate;
  endDateVal = edate;
  startDate[0].value = startDateVal;
  startDate[1].value = startDateVal;
  endDate[0].value = endDateVal;
  endDate[1].value = endDateVal;
  getData({
    action: "getdevicebalance",
    endtime: new Date(endDateVal).getTime() / 1000,
    echo: "enddate",
  });
  activeDevices.innerText = "Loading...";
  earningDevices.innerText = "Loading...";
}
function onDateChangeTrans(sdate, edate) {
  getData({
    action: "gettransactions",
    endtime: new Date(edate).getTime(),
    starttime: new Date(sdate).getTime(),
    echo: "transactions",
  });
}
window.onhashchange();

function getData(data) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      parseRes(req.responseText);
    }
  };
  var queryString=''
  for(var x in data){
    queryString+=x+'='+data[x]
    queryString+='&'
  }
  queryString=queryString.substr(0,queryString.length-1)
  console.log(queryString)
  req.open("GET", "/dashboard/getdata?"+queryString, true);
  req.send();
}