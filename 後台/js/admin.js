const url = `${originUrl}${apiPath}`;
const orderList = document.querySelector('.orderList');
const discardAllBtn = document.querySelector('.discardAllBtn');
let orders = [];
function getOrder(){
    axios.get(`${url}/orders`,{
        headers:{
            authorization: token
        }
    })
    .then(res => {
        orders = res.data.orders
        renderOrderList(orders);
        renderC3();
    })
    .catch(error => {
        console.log(error);
        Swal.fire({
            title: "資料有誤!",
            icon: "error",
            draggable: true
        });
    })
}
function renderOrderList(orders){
    let str ='';
    // 組產品字串
    orders.forEach(item => {
        let productName = '';
        item.products.forEach(product => {
            productName += `<p>${product.title} x ${product.quantity}</p>`;
        })
        // 判斷訂單結果狀態
        let orderStatus = '';
        if(item.paid === true){
            orderStatus = '已付款';
        }else{
            orderStatus = '未付款';
        }
        // 時間戳
        const timeStamp = new Date(item.createdAt*1000);
        const time = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
        str += `   
            <tr>
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    ${productName}
                </td>
                <td>${time}</td>
                <td class="orderStatus">
                    <a class="jsOrderStatus" data-id ="${item.id}" data-status = ${item.paid}  href="#">${orderStatus}</a>
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn" data-id = "${item.id}" value="刪除">
                </td>
            </tr>`
    })
    orderList.innerHTML = str;
}

orderList.addEventListener('click',e => {
    e.preventDefault();
    let status = e.target.getAttribute('data-status');
    let id = e.target.getAttribute('data-id');
    let targetClass = e.target.getAttribute('class');
    if(targetClass === 'delSingleOrder-Btn'){
        delSingleOrder(id);
        return
    }
    if(targetClass === 'jsOrderStatus'){
        isStatus(status,id);
        return
    }
    
})
//刪除一筆訂單
function delSingleOrder(id){
    axios.delete(`${url}/orders/${id}`,{
        headers:{
            authorization: token
        }
    })
    .then(res => {
        console.log(res.data);
        Swal.fire({
            title: "已刪除這筆訂單!",
            icon: "success",
            draggable: true
        });
        getOrder();
    })
    .catch(error => {
        console.log(error);
        Swal.fire({
            title: "資料有誤!",
            icon: "error",
            draggable: true
        });
    })
}
// 刪除全部訂單
discardAllBtn.addEventListener('click',e => {
    e.preventDefault();
    delAllOrder();
})
function delAllOrder(){
    axios.delete(`${url}/orders`,{
        headers:{
            authorization: token
        }
    })
    .then(res => {
        console.log(res.data);
        Swal.fire({
            title: "訂單已全部刪除!",
            icon: "success",
            draggable: true
        });
        getOrder();
    })
    .catch(error => {
        console.log(error);
        Swal.fire({
            title: "資料有誤!",
            icon: "error",
            draggable: true
        });
    })
}
// 修改狀態
function isStatus(status,id){
    let newStatus;
    if(status === 'true'){
        newStatus = false;
    }else{
        newStatus = true;
    }
    axios.put(`${url}/orders`,{
        data: {
            id: id,
            paid: newStatus
        }
    },
    {
        headers:{
            authorization: token
        }
    })
    .then(res => {
        console.log(res);
        getOrder();
        Swal.fire({
            title: "訂單修改成功!",
            icon: "success",
            draggable: true
        });
    })
    .catch(error => {
        Swal.fire({
            title: "資料有誤!",
            icon: "error",
            draggable: true
        });
    })
}

function init(){
    getOrder();
}
init();

// C3.js
function renderC3(){
    let obj = {};
    let ary = [];
    orders.forEach(item => {
        item.products.forEach( type => {
            if(obj[type.title] === undefined){
                obj[type.title] = type.price * type.quantity;
            }else{
                obj[type.title] += type.price * type.quantity;
            }
        })
    })
    ary = Object.entries(obj);
    //整理排序
    ary.sort((a,b) => b[1]-a[1]);
    if(ary.length > 3){
        let otherTOtal = 0;
        ary.forEach((item,index) =>{
            if(index > 2){
                otherTOtal += ary[index][1];
            }
        })
        ary.splice(3,ary.length-1);
        ary.push(['其他',otherTOtal]);
    }
    console.log(ary);
    //計算C3 其他項目
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: ary,
    },
    color: {
        pattern: ["#301E5F","#5434A7","#9D7FEA","#DACBFF"]
    }
});
}