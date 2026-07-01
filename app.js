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
const todayButton = document.getElementById("todayButton");
const tomorrowButton = document.getElementById("tomorrowButton");
const generateBathListButton = document.getElementById(
  "generateBathListButton",
);
const bathPreviewList = document.getElementById("bathPreviewList");
const generatePrintTargetButton = document.getElementById(
  "generatePrintTargetButton",
);
const goPrintButton = document.getElementById("goPrintButton");
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
    resetPrintSection();
    showSection(mainMenuSection);
  });
});

function sortUsers(users) {
  return [...users].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }

    if (!a.active && !b.active) {
      return (a.kana || "").localeCompare(b.kana || "", "ja");
    }

    if (a.serviceType !== b.serviceType) {
      if (a.serviceType === "day") return -1;
      if (b.serviceType === "day") return 1;
    }

    return (a.kana || "").localeCompare(b.kana || "", "ja");
  });
}

// 利用者一覧の画面描写に関する動作
function renderUsers() {
  const userList = document.getElementById("userList");

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // users.sort((a, b) => {
  //   if (a.serviceType !== b.serviceType) {
  //     return a.serviceType.localeCompare(b.serviceType);
  //   }

  //   return (a.kana || "").localeCompare(b.kana || "", "ja");
  // });

  const sortedUsers = sortUsers(users);

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

  sortedUsers.forEach((user) => {
    const userCard = document.createElement("div");
    userCard.classList.add("user-card");

    if (!user.active) {
      userCard.classList.add("inactive-user");
    }

    const bathDaysText = (user.bathDays || [])
      .map((day) => bathDaysMap[day])
      .join("・");

    userCard.innerHTML = `
        <p class="user-card-kana">${user.kana || ""}</p>
        <h3 class="user-card-name">${user.name}</h3>
        <p>利用形態：${serviceTypeMap[user.serviceType]}</p>
        <p>入浴曜日：${bathDaysText}</p>
        <p>入浴形態：${bathTypeMap[user.bathType]}</p>
        <div class="user-card-actions">
        <button type="button" class="edit-button btn btn-secondary" data-id="${user.id}">編集</button>
        <button type="button" class="inactive-button btn btn-danger" data-id="${user.id}">${user.active ? "利用終了" : "利用再開"}</button>
        <button type="button" class="delete-button btn btn-danger" data-id="${user.id}">削除</button>
        </div>
        `;

    const deleteButton = userCard.querySelector(".delete-button");
    const editButton = userCard.querySelector(".edit-button");
    const inactiveButton = userCard.querySelector(".inactive-button");

    // 削除ボタンの動作
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
      document.getElementById("kanaInput").value = user.kana || "";
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

    // 利用終了/再開ボタンの動作
    inactiveButton.addEventListener("click", () => {
      const nextActiveState = !user.active;
      const message = nextActiveState
        ? `${user.name}さんを利用再開に変更してよろしいですか？`
        : `${user.name}さんを利用終了に変更してよろしいですか？`;

      const result = confirm(message);

      if (!result) return;

      const updatedUsers = users.map((targetUser) => {
        if (targetUser.id !== user.id) {
          return targetUser;
        }

        return {
          ...targetUser,
          active: nextActiveState,
        };
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));
      renderUsers();
    });

    userList.appendChild(userCard);
  });
}

// 利用者登録画面のフォームの動作
inputForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const userNameInput = document.getElementById("userNameInput");
  const userName = userNameInput.value.trim();

  const kanaInput = document.getElementById("kanaInput");
  const kana = kanaInput.value.trim();

  const kanaPattern = /^[ァ-ヶー]+$/;
  if (!kanaPattern.test(kana)) {
    alert("フリガナは全角カタカナで入力してください。");
    kanaInput.focus();
    return;
  }

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
    kana: kana,
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

  const dayUsers = users
    .filter((user) => {
      return (
        user.serviceType === "day" && user.active && (user.bathDays || []).includes(dayKey)
      );
    })
    .sort((a, b) => {
      const aScheduled = (a.bathDays || []).includes(dayKey);
      const bScheduled = (b.bathDays || []).includes(dayKey);

      if (aScheduled !== bScheduled) {
        return bScheduled - aScheduled;
      }

      return (a.kana || "").localeCompare(b.kana || "", "ja");
    });

  const residentUsers = users
    .filter((user) => {
      return user.serviceType === "resident" && user.active;
    })
    .sort((a, b) => {
      const aScheduled = (a.bathDays || []).includes(dayKey);
      const bScheduled = (b.bathDays || []).includes(dayKey);

      if (aScheduled !== bScheduled) {
        return bScheduled - aScheduled;
      }

      return (a.kana || "").localeCompare(b.kana || "", "ja");
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
            <h3 class="section-title" id="generateBathListSectionTitle">入居者</h3>
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

// 日付入力フォームのデータ型を整理する関数
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 当日ボタン
todayButton.addEventListener("click", () => {
  const today = new Date();

  printDateInput.value = formatDateForInput(today);
});

// 翌日ボタン
tomorrowButton.addEventListener("click", () => {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  printDateInput.value = formatDateForInput(tomorrow);
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
    })
    .sort((a, b) => {
      return (a.kana || "").localeCompare(b.kana || "", "ja");
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
  goPrintButton.classList.remove("hidden");
});

function renderPrintPreview(users) {
  const printPreview = document.getElementById("printPreview");
  const selectedDate = document.getElementById("printDateInput").value;

  const bathTypeMap = {
    general: "一般浴",
    machine: "機械浴",
    shower: "シャワー浴",
    wipe: "清拭",
  };

  printPreview.innerHTML = `
        <div class="bath-sheet-preview">
            <h2 class="section-title no-print">入浴表プレビュー</h2>

            <p class="bath-sheet-date">${formatDateForDisplay(selectedDate)}<strong> 入浴表</strong></p>

            <div class="table-wrap">
                <table class="bath-sheet-table">
                    <thead>
                        <tr>
                            <th class="col-name">氏名</th>
                            <th class="col-bath">入浴</th>
                            <th class="col-time">時間</th>
                            <th class="col-vital">浴前バイタル</th>
                            <th class="col-type">入浴形態</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${users
                          .map((user) => {
                            return `
                                <tr>
                                    <td class="${user.serviceType === "resident" ? "resident-name" : ""}">${user.name}</td>
                                    <td>□</td>
                                    <td></td>
                                    <td></td>
                                    <td>${bathTypeMap[user.bathType]}</td>
                                </tr>
                            `;
                          })
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function formatDateForDisplay(dateString) {
  const date = new Date(dateString);

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDay = weekDays[date.getDay()];

  return `${year}年${month}月${day}日（${weekDay}）`;
}

goPrintButton.addEventListener("click", () => {
  window.print();
});

function resetPrintSection() {
  printDateInput.value = "";
  bathPreviewList.innerHTML = "";
  printPreview.innerHTML = "";
  generatePrintTargetButton.classList.add("hidden");
  goPrintButton.classList.add("hidden");
}

renderUsers();
