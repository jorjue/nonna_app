'use strict';

// グローバル定数
const inputForm = document.getElementById('inputForm');
const mainMenuSection = document.getElementById('mainMenuSection');
const userRegisterSection = document.getElementById('userRegisterSection');
const userDataSection = document.getElementById('userDataSection');
const printSection = document.getElementById('printSection');
const userRegisterButton = document.getElementById('userRegister');
const userDataButton = document.getElementById('userData');
const printButton = document.getElementById('print');
const backButton = document.querySelectorAll('.back-button');

function showSection(section) {
    mainMenuSection.classList.add('hidden');
    userRegisterSection.classList.add('hidden');
    userDataSection.classList.add('hidden');
    printSection.classList.add('hidden');

    section.classList.remove('hidden');
}

showSection(mainMenuSection);

userRegisterButton.addEventListener('click', () => {
    showSection(userRegisterSection);
});

userDataButton.addEventListener('click', () => {
    showSection(userDataSection);
});

printButton.addEventListener('click', () => {
    showSection(printSection);
});

backButton.forEach((button) => {
    button.addEventListener('click', () => {
        showSection(mainMenuSection);
    });
});

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
        <button type="button" class="delete-button" data-id="${user.id}">削除</button>
        `;

        const deleteButton = userCard.querySelector('.delete-button');

        deleteButton.addEventListener('click', () => {
            const result = confirm(`${user.name}さんを削除しますか？`);

            if (!result) {
               return;
            }

            const updatedUsers = users.filter((targetUser) => {
                return targetUser.id !== user.id;
            });

            localStorage.setItem('users', JSON.stringify(updatedUsers));

            renderUsers();
        });

        userList.appendChild(userCard);
    });
}

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