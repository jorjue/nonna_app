'use strict';

function renderUsers() {
    const userList = document.getElementById('userList');

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const serviceTypeMap = {
        day: 'デイサービス',
        resident: '入居',
    }

    const bathTypeMap = {
        general: '一般浴',
        machine: '機械浴',
        shower: 'シャワー浴',
        wipe: '清拭',
    }

    const bathDaysMap = {
        sun: '日',
        mon: '月',
        tue: '火',
        wed: '水',
        thu: '木',
        fri: '金',
        sat: '土',
    }

    userList.innerHTML = '';

    users.forEach((user) => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');

        const bathDaysText = (user.bathDays || []).map((day) => bathDaysMap[day]).join('・');

        userCard.innerHTML = `<h3 class="user-card-name">${user.name}</h3>
        <p>利用形態：${serviceTypeMap[user.serviceType]}</p>
        <p>入浴曜日：${bathDaysText}</p>
        <p>入浴形態：${bathTypeMap[user.bathType]}</p>
        `;

        userList.appendChild(userCard);
    });
}

const inputForm = document.getElementById('inputForm');

inputForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const userNameInput = document.getElementById('userNameInput');
    const userName = userNameInput.value.trim();

    const serviceTypeInput = document.getElementById('serviceTypeInput');
    const serviceType = serviceTypeInput.value;

    const bathDays = [];
    const checkedBathDays = document.querySelectorAll(
        'input[name="bathDays"]:checked'
    );

    checkedBathDays.forEach((checkbox) => {
        bathDays.push(checkbox.value);
    });

    const bathTypeInput = document.getElementById('bathType');
    const bathType = bathTypeInput.value;

    const userData = {
        id: crypto.randomUUID(),
        name: userName,
        serviceType: serviceType,
        bathDays: bathDays,
        bathType: bathType,
        active: true
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    users.push(userData);

    localStorage.setItem('users', JSON.stringify(users));

    document.getElementById('inputForm').reset();
    
    renderUsers();

});

renderUsers();