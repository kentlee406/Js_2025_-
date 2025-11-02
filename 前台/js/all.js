const url = `${frontOriginUrl}${apiPath}`;
const productList = document.querySelector('.productWrap');
const productFilter = document.querySelector('.productDisplay');
const cartList = document.querySelector('.cartList');
const discardAllBtn = document.querySelector('.discardAllBtn');
const allPrice = document.querySelector('.allPrice');
const customerName =document.querySelector('#customerName');
const customerPhone =document.querySelector('#customerPhone');
const customerEmail =document.querySelector('#customerEmail');
const customerAddress =document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay')
const orderInfoBtn =document.querySelector('.orderInfo-btn');
const orderInfoForm = document.querySelector('.orderInfo-form');
const inputs = document.querySelectorAll("input[name],select[data=payment]");
let products = [];
let carts = [];
let totalPrice = 0;

// 取得產品列表
function getProduct(){
    axios.get(`${url}/products`)
    .then(res => {
        products = res.data.products;
        renderProduct(products);
    })
    .catch(error => {
        console.log(error);
    })
}
// 渲染產品列表
function renderProduct(products){
    let str = '';
    products.forEach( (item) => {
        str += `           
            <li class="productCard">
                <h4 class="productType">${item.category}</h4>
                <img src="${item.images}" alt="">
                <a href="#" data-id =${item.id} class="addCardBtn">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${thousandsStamp(item.origin_price)}</del>
                <p class="nowPrice">NT$${thousandsStamp(item.price)}</p>
            </li>`
    })
    productList.innerHTML = str;
}
// 產品分類
productFilter.addEventListener('change',(e) => {
    e.preventDefault();
    let filterData = products.filter( item => item.category === e.target.value || e.target.value === '全部');
    renderProduct(filterData);
})
// 取得購物車列表
function getCarts(){
    axios.get(`${url}/carts`)
    .then(res => {
        carts = res.data.carts;
        totalPrice = `NT$${thousandsStamp(res.data.finalTotal)}`;
        renderCartsList(carts,totalPrice);
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
// 顯示購物車列表
function renderCartsList(carts){
    let str = '';
    carts.forEach(item => {
        str += `               
                <tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="https://i.imgur.com/HvT3zlU.png" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${thousandsStamp(item.product.price)}</td>
                    <td>${thousandsStamp(item.quantity)}</td>
                    <td>NT$${thousandsStamp(item.quantity * item.product.price)}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id ="${item.id}">
                            clear
                        </a>
                    </td>
                </tr>`
    })
    cartList.innerHTML = str;
    allPrice.textContent = totalPrice;
}

// 點擊加入購物車
productList.addEventListener('click' ,e => {
    e.preventDefault();
    if(e.target.getAttribute('class') !== 'addCardBtn'){
        return
    }
    let productId = e.target.getAttribute('data-id');
    let cartNum = 1;
    carts.forEach(item => {
        if(item.product.id === productId){
            cartNum = item.quantity +=1;
        }
    })
    addCart(productId,cartNum);
})
function addCart(id,cartNum){
    axios.post(`${url}/carts`,{
        data: {
            productId: id,
            quantity: cartNum
        }
    })
    .then(res => {
        console.log(res.data.carts);
        getCarts();
        Swal.fire({
            title: "成功加入購物車!",
            icon: "success",
            draggable: true
        });
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
// 刪除全部
function deleteAllCarts(){
    axios.delete(`${url}/carts`)
    .then(res => {
        console.log(res.data);
        getCarts();
        Swal.fire({
            title: "全部資料已經刪除!",
            icon: "success",
            draggable: true
        });
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
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    deleteAllCarts();
});
// 刪除部分
function deleteCart(id){
    axios.delete(`${url}/carts/${id}`)
    .then(res => {
        console.log(res.data);
        getCarts();
        Swal.fire({
            title: "這筆商品已刪除!",
            icon: "success",
            draggable: true
        });
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
cartList.addEventListener('click',function(e){
    e.preventDefault();
    const deleteId = e.target.getAttribute('data-id')
    if(deleteId === null){
        return;
    }
    deleteCart(deleteId);
})
// 點擊傳送訂單
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    if(carts.length === 0){
        Swal.fire({
            icon: "error",
            title: "訂單送出失敗",
            text: "購物車內沒東西",
            footer: '真糟糕，你沒有買東西啊!'
        });
        return
    }
    if(customerName.value === '' ||customerPhone.value=== '' || customerEmail.value === '' || customerAddress.value === '' || tradeWay.value === ''){
        Swal.fire({
            icon: "error",
            title: "訂單送出失敗",
            text: "訂單資料沒有填寫完整!",
            footer: '真糟糕，你沒有填寫完整!'
        });
        return
    }
    let obj = {
        data:{
            user: {
                name: customerName.value.trim(),
                tel:customerPhone.value,
                email: customerEmail.value.trim(),
                address: customerAddress.value.trim(),
                payment: tradeWay.value
            }
        }
    };
    sendOrder(obj)
})
// 表單驗證
let constraints = {
    "姓名": {
        resence:{
            message: "必填欄位"
        }
    },
    "電話": {
        presence:{
            message: "必填欄位"
        },
        length: {
            minimum: 8,
            message: "需大於 8 碼數字"
        }
    },
    Email: {
        presence:{
            message: "必填欄位"
        },
        email:{
            message: "請輸入正確的信箱格式"
        }
    },
    "寄送地址": {
        presence:{
            message: "必填欄位"
        }
    }
}
inputs.forEach( item => {
    item.addEventListener('change', (e) => {
        e.preventDefault();
        item.nextElementSibling.textContent = '';
        let errorMessage = validate(orderInfoForm , constraints) || '';
        if(errorMessage){
            Object.keys(errorMessage).forEach(key => {
                let msg = document.querySelector(`[data-message="${key}"]`);
                msg.textContent = errorMessage[key];
            })
        }
    })
})

//傳送訂單
function sendOrder(obj){
    axios.post(`${url}/orders`,obj)
    .then(res => {
        console.log(res.data);
        orderInfoForm.reset();
        getCarts();
        Swal.fire({
            title: "訂單成功送出!",
            icon: "success",
            draggable: true
        });
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

// 千分位
function thousandsStamp(x){
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

// 初始化
function init(){
    getProduct();
    getCarts();
}
init();

