"use strict";

// グローバル定数
const inputForm = document.getElementById("inputForm");
const mainMenuSection = document.getElementById("mainMenuSection");
const userRegisterSection = document.getElementById("userRegisterSection");
const userDataSection = document.getElementById("userDataSection");
const printSection = document.getElementById("printSection");
const userRegisterButton = document.getElementById("userRegister");
const userDataButton = document.getElementById("userData");
const printButton = document.getElementById("print");
const backButton = document.querySelectorAll(".back-button");
const submitButton = inputForm.querySelector('button[type="submit"]');
const userRegisterTitle = userRegisterSection.querySelector(".section-title");
const printDateInput = document.getElementById("printDateInput");
const generateBathListButton = document.getElementById(
  "generateBathListButton",
);
const bathPreviewList = document.getElementById("bathPreviewList");
const generatePrintTargetButton = document.getElementById(
  "generatePrintTargetButton",
);
const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const attendanceData = [];

// 編集中かどうか判定する
let editingUserId = null;

// メインメニューの画面遷移の動作
function showSection(section) {
  mainMenuSection.classList.add("hidden");
  userRegisterSection.classList.add("hidden");
  userDataSection.classList.add("hidden");
  printSection.classList.add("hidden");

  section.classList.remove("hidden");
}

showSection(mainMenuSection);

// 利用者情報登録画面ボタン
userRegisterButton.addEventListener("click", () => {
  editingUserId = null;

  submitButton.textContent = "登録";

  userRegisterTitle.textContent = "利用者情報入力フォーム";

  inputForm.reset();

  showSection(userRegisterSection);
});

// 利用者一覧ボタン
userDataButton.addEventListener("click", () => {
  showSection(userDataSection);
});

// 帳票印刷ボタン
printButton.addEventListener("click", () => {
  generatePrintTargetButton.classList.add("hidden");
  bathPreviewList.innerHTML = "";

  showSection(printSection);
});

// 各ページの戻るボタンの動作
backButton.forEach((button) => {
  button.addEventListener("click", () => {
    showSection(mainMenuSection);
  });
});

// 利用者一覧の画面描写に関する動作
function renderUsers() {
  const userList = document.getElementById("userList");

  const users = JSON.parse(localStorage.getItem("users")) || [];

  users.sort((a, b) => {
    if (a.serviceType !== b.serviceType) {
      return a.serviceType.localeCompare(b.serviceType);
    }

    return a.name.localeCompare(b.name, "ja");
  });

  const serviceTypeMap = {
    day: "デイサービス",
    resident: "入居",
  };

  const bathTypeMap = {
    general: "一般浴",
    machine: "機械浴",
    shower: "シャワー浴",
    wipe: "清拭",
  };

  const bathDaysMap = {
    sun: "日",
    mon: "月",
    tue: "火",
    wed: "水",
    thu: "木",
    fri: "金",
    sat: "土",
  };

  userList.innerHTML = "";

  if (users.length === 0) {
    userList.innerHTML = `
            <p class="empty-message">
                登録されている利用者はいません。
            </p>
        `;

    return;
  }

  users.forEach((user) => {
    const userCard = document.createElement("div");
    userCard.classList.add("user-card");

    const bathDaysText = (user.bathDays || [])
      .map((day) => bathDaysMap[day])
      .join("・");

    userCard.innerHTML = `<h3 class="user-card-name">${user.name}</h3>
        <p>利用形態：${serviceTypeMap[user.serviceType]}</p>
        <p>入浴曜日：${bathDaysText}</p>
        <p>入浴形態：${bathTypeMap[user.bathType]}</p>
        <div class="user-card-actions">
        <button type="button" class="edit-button btn btn-secondary" data-id="${user.id}">編集</button>
        <button type="button" class="delete-button btn btn-danger" data-id="${user.id}">削除</button>
        </div>
        `;

    const deleteButton = userCard.querySelector(".delete-button");
    const editButton = userCard.querySelector(".edit-button");

    deleteButton.addEventListener("click", () => {
      const result = confirm(`${user.name}さんを削除しますか？`);

      if (!result) {
        return;
      }

      const updatedUsers = users.filter((targetUser) => {
        return targetUser.id !== user.id;
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      renderUsers();
    });

    // 利用者情報編集ボタンの動作
    editButton.addEventListener("click", () => {
      editingUserId = user.id;

      document.getElementById("userNameInput").value = user.name;
      document.getElementById("serviceTypeInput").value = user.serviceType;
      document.getElementById("bathTypeInput").value = user.bathType;

      const bathDayCheckboxes = document.querySelectorAll(
        'input[name="bathDays"]',
      );

      bathDayCheckboxes.forEach((checkbox) => {
        checkbox.checked = (user.bathDays || []).includes(checkbox.value);
      });

      submitButton.textContent = "更新";

      userRegisterTitle.textContent = "利用者情報編集";

      showSection(userRegisterSection);

      document.getElementById("userNameInput").focus();
    });

    userList.appendChild(userCard);
  });
}

// 利用者登録画面のフォームの動作
inputForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const userNameInput = document.getElementById("userNameInput");
  const userName = userNameInput.value.trim();

  const serviceTypeInput = document.getElementById("serviceTypeInput");
  const serviceType = serviceTypeInput.value;

  const bathDays = [];
  const checkedBathDays = document.querySelectorAll(
    'input[name="bathDays"]:checked',
  );

  checkedBathDays.forEach((checkbox) => {
    bathDays.push(checkbox.value);
  });

  const bathTypeInput = document.getElementById("bathTypeInput");
  const bathType = bathTypeInput.value;

  const userData = {
    id: crypto.randomUUID(),
    name: userName,
    serviceType: serviceType,
    bathDays: bathDays,
    bathType: bathType,
    active: true,
  };

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const isEditing = Boolean(editingUserId);

  if (isEditing) {
    users = users.map((user) => {
      if (user.id !== editingUserId) {
        return user;
      }
      return {
        ...userData,
        id: editingUserId,
        active: user.active,
      };
    });

    editingUserId = null;

    submitButton.textContent = "登録";

    userRegisterTitle.textContent = "利用者情報入力フォーム";
  } else {
    users.push(userData);
  }

  localStorage.setItem("users", JSON.stringify(users));

  document.getElementById("inputForm").reset();

  renderUsers();

  if (isEditing) {
    showSection(userDataSection);
  } else {
    userNameInput.focus();
  }
});

// 入浴予定者表示ボタンの動作
generateBathListButton.addEventListener("click", () => {
  const selectedDate = printDateInput.value;

  if (!selectedDate) {
    alert("日付を選択してください。");
    return;
  }

  const date = new Date(selectedDate);
  const dayKey = dayKeys[date.getDay()];

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const bathTypeMap = {
    general: "一般浴",
    machine: "機械浴",
    shower: "シャワー浴",
    wipe: "清拭",
  };

  const dayUsers = users.filter((user) => {
    return user.serviceType === "day" && (user.bathDays || []).includes(dayKey);
  });

  const residentUsers = users
    .filter((user) => {
      return user.serviceType === "resident";
    })
    .sort((a, b) => {
      const aScheduled = (a.bathDays || []).includes(dayKey);
      const bScheduled = (b.bathDays || []).includes(dayKey);

      if (aScheduled !== bScheduled) {
        return bScheduled - aScheduled;
      }

      return a.name.localeCompare(b.name, "ja");
    });

  bathPreviewList.innerHTML = "";
  generatePrintTargetButton.classList.add("hidden");

  if (dayUsers.length === 0 && residentUsers.length === 0) {
    bathPreviewList.innerHTML = `
            <p class="empty-message">
                表示できる利用者がいません。
            </p>
        `;
    return;
  }

  if (dayUsers.length > 0) {
    const dayUserGroup = document.createElement("div");
    dayUserGroup.classList.add("stack-sm");

    dayUserGroup.innerHTML = `
            <h3 class="section-title">デイサービス利用者</h3>
        `;

    dayUsers.forEach((user) => {
      const item = document.createElement("div");
      item.classList.add("user-card");

      item.innerHTML = `
                <h3 class="user-card-name">${user.name}</h3>
                <p>入浴形態：${bathTypeMap[user.bathType]}</p>
                <label>
                    <input
                        type="checkbox"
                        class="attendance-checkbox"
                        checked
                        data-id="${user.id}"
                    >
                    利用
                </label>
            `;

      dayUserGroup.appendChild(item);
    });

    bathPreviewList.appendChild(dayUserGroup);
  }

  if (residentUsers.length > 0) {
    const residentUserGroup = document.createElement("div");
    residentUserGroup.classList.add("stack-sm");

    residentUserGroup.innerHTML = `
            <h3 class="section-title">入居者</h3>
        `;

    residentUsers.forEach((user) => {
      const isScheduledBathDay = (user.bathDays || []).includes(dayKey);

      const item = document.createElement("div");
      item.classList.add("user-card");

      item.innerHTML = `
                <h3 class="user-card-name">${user.name}</h3>
                <p>入浴形態：${bathTypeMap[user.bathType]}</p>
                <label>
                    <input
                        type="checkbox"
                        class="resident-bath-checkbox"
                        ${isScheduledBathDay ? "checked" : ""}
                        data-id="${user.id}"
                    >
                    ${isScheduledBathDay ? "通常入浴" : "振替入浴"}
                </label>
            `;

      residentUserGroup.appendChild(item);
    });

    bathPreviewList.appendChild(residentUserGroup);
  }
  generatePrintTargetButton.classList.remove("hidden");
});

// 印刷対象作成ボタンの動作
generatePrintTargetButton.addEventListener("click", () => {
  const selectedCheckboxes = bathPreviewList.querySelectorAll(
    ".attendance-checkbox:checked, .resident-bath-checkbox:checked",
  );

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const bathTypeMap = {
    general: "一般浴",
    machine: "機械浴",
    shower: "シャワー浴",
    wipe: "清拭",
  };

  const printTargetUsers = Array.from(selectedCheckboxes)
    .map((checkbox) => {
      const user = users.find((targetUser) => {
        return targetUser.id === checkbox.dataset.id;
      });

      if (!user) {
        return null;
      }

      return {
        ...user,
        bathStatus: checkbox.classList.contains("resident-bath-checkbox")
          ? checkbox.parentElement.textContent.trim()
          : "利用",
      };
    })
    .filter((user) => {
      return user !== null;
    });

  if (printTargetUsers.length === 0) {
    alert("印刷対象の利用者が選択されていません。");
    return;
  }

  const printTargetGroup = document.createElement("div");
  printTargetGroup.classList.add("stack-sm");

  printTargetGroup.innerHTML = `
        <h3 class="section-title">印刷対象者</h3>
    `;

  printTargetUsers.forEach((user) => {
    const item = document.createElement("div");
    item.classList.add("user-card");

    item.innerHTML = `
            <h3 class="user-card-name">${user.name}</h3>
            <p>入浴形態：${bathTypeMap[user.bathType]}</p>
            <p>区分：${user.bathStatus}</p>
        `;

    printTargetGroup.appendChild(item);
  });

  renderPrintPreview(printTargetUsers);
});

function renderPrintPreview(users) {
  const printPreview = document.getElementById("printPreview");

  printPreview.innerHTML = "";

  const selectedDate = document.getElementById("printDateInput").value;

  const previewCard = document.createElement("div");

  previewCard.classList.add("user-card");

  previewCard.innerHTML = `
        <h2 class="section-title">
            入浴表プレビュー
        </h2>

        <p>${selectedDate}</p>

        <ul>
            ${users.map((user) => `<li>${user.name}</li>`).join("")}
        </ul>
    `;

  printPreview.appendChild(previewCard);
}

renderUsers();
