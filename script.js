// 奥佛寺 v6.3 - 优化版JavaScript文件
document.addEventListener('DOMContentLoaded', () => {
    // --- 数据区 ---
    const heatData = [
        {"program":"HKU - CS","heat":92,"category":"理工","icon":"💻"},
        {"program":"HKUST - BA","heat":85,"category":"商科","icon":"📈"},
        {"program":"CUHK - MKT","heat":65,"category":"商科","icon":"🛒"},
        {"program":"CityU - DS","heat":35,"category":"理工","icon":"📊"},
        {"program":"PolyU - EIE","heat":55,"category":"理工","icon":"💡"},
        {"program":"HKU - Finance","heat":78,"category":"商科","icon":"💰"},
        {"program":"CUHK - GP", "heat":45, "category":"人文社科", "icon":"🌍"}
    ];
    
    const fortunes = [
        "出门捡到钱","刮中大彩票","偶像回你私信","体重轻了5斤",
        "喜欢的人向你表白","干饭不用排队","论文一稿就过",
        "DDL自动延长","水逆即刻退散","抽卡一发入魂"
    ];
    
    // 功德排行榜数据
    let leaderboardData = [
        { name: "一心求佛的有钱人", merit: 98521 },
        { name: "卷王之王", merit: 76543 },
        { name: "Offer收割机", merit: 66666 },
        { name: "潜心修行的海王", merit: 54321 },
        { name: "施主您", merit: 0, isUser: true }, // 您的位置
        { name: "拜佛的咸鱼", merit: 12345 }
    ];

    // --- 元素获取 ---
    const form = document.getElementById('application-form');
    const programInput = document.getElementById('program');
    const muyuBtn = document.getElementById('muyu-submit-btn');
    const muyuText = document.getElementById('muyu-text');
    const meritCounterDisplay = document.getElementById('merit-counter-display');
    const knockSound = document.getElementById('knock-sound');
    const leaderboardList = document.getElementById('leaderboard-list');
    let merit = 0;

    // --- 核心函数区 ---
    muyuBtn.addEventListener('click', () => {
        // 播放音效
        try {
            knockSound.currentTime = 0;
            knockSound.play();
        } catch(e) { 
            console.log("Sound play failed."); 
        }

        if (programInput.value.trim() !== '') {
            submitApplication();
        } else {
            addMerit();
        }
    });
    
    programInput.addEventListener('input', () => {
        if (programInput.value.trim() !== '') {
            muyuText.textContent = '提交善缘';
        } else {
            muyuText.textContent = '敲此积福';
        }
    });

    function addMerit() {
        merit++;
        meritCounterDisplay.textContent = `当前功德: ${merit}`;
        
        // 直接更新排行榜中的功德，避免重新渲染整个列表
        const userRankItem = document.getElementById('user-rank-merit');
        if (userRankItem) {
            userRankItem.textContent = merit;
            // 更新数据中的功德值
            const userData = leaderboardData.find(user => user.isUser);
            if (userData) {
                userData.merit = merit;
            }
        }

        // 优化动画：减少动画时间，使用更轻量的实现
        const plusOne = document.createElement('div');
        plusOne.textContent = '功德+1';
        plusOne.classList.add('merit-plus-one');
        muyuBtn.parentNode.appendChild(plusOne);
        // 使用setTimeout而不是animationend事件，更可靠
        setTimeout(() => { 
            if (plusOne.parentNode) {
                plusOne.remove(); 
            }
        }, 600);
    }

    function submitApplication() {
        const school = form.elements.school.value;
        const program = form.elements.program.value;
        const status = form.elements.status.value;
        const tableBody = document.querySelector('#cases-table tbody');
        const newRow = tableBody.insertRow(0);
        newRow.style.backgroundColor = '#fffbe0';
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        newRow.innerHTML = `<td>${school}</td><td>${program}</td><td><span class="status status-${status.toLowerCase()}">${status}</span></td><td class="fortune-cell">✨ ${randomFortune} ✨</td>`;
        showFeedbackModal(status, randomFortune);
        form.reset();
        muyuText.textContent = '敲此积福';
    }
    
    // 渲染排行榜函数
    function renderLeaderboard() {
        // 确保数据按功德降序排列
        leaderboardData.sort((a, b) => b.merit - a.merit);
        leaderboardList.innerHTML = ''; // 清空

        leaderboardData.forEach((user, index) => {
            const rank = index + 1;
            const item = document.createElement('li');
            item.className = `leaderboard-item rank-${rank}`;

            let rankDisplay = rank;
            if(rank === 1) rankDisplay = '👑';
            else if(rank === 2) rankDisplay = '🥈';
            else if(rank === 3) rankDisplay = '🥉';
            
            let meritSpanId = '';
            if (user.isUser) {
                item.id = 'user-rank-item';
                meritSpanId = 'id="user-rank-merit"';
            }

            item.innerHTML = `
                <span class="leaderboard-rank">${rankDisplay}</span>
                <span class="leaderboard-name">${user.name}</span>
                <span class="leaderboard-merit" ${meritSpanId}>${user.merit}</span>
            `;
            leaderboardList.appendChild(item);
        });
    }

    function renderDashboard(filter = 'all') {
        const dashboard = document.getElementById('heat-dashboard');
        dashboard.innerHTML = '';
        const filteredData = (filter === 'all') ? heatData : heatData.filter(d => d.category === filter);
        filteredData.forEach(data => {
            let colorClass = 'cool';
            if (data.heat > 75) colorClass = 'hot';
            else if (data.heat > 40) colorClass = 'warm';
            
            const item = document.createElement('div');
            item.className = `heat-item ${colorClass}`;
            item.innerHTML = `
                <div class="heat-item-header">
                    <span class="heat-item-header-icon">${data.icon}</span>
                    <h3>${data.program}</h3>
                </div>
                <div class="heat-bar-container">
                    <div class="heat-bar">
                        <div class="heat-level ${colorClass}" style="width: ${data.heat}%"></div>
                    </div>
                    <span class="heat-text">${data.heat} 人已报</span>
                </div>
            `;
            dashboard.appendChild(item);
        });
    }
    
    document.getElementById('filter-container').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderDashboard(e.target.dataset.filter);
        }
    });
    
    function showFeedbackModal(status, fortune) {
        const modal = document.getElementById('feedback-modal');
        const feedbackMessages = {
            'Offer': { title: "恭喜！前程似锦！", message: "您的善缘已结善果！" },
            'Interview': { title: "吉兆！好运将至！", message: "面试是成功的序章！" },
            'Rejection': { title: "莫愁！福报在后！", message: "塞翁失马，焉知非福！" }
        };
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>${feedbackMessages[status].title}</h3>
                <p>${feedbackMessages[status].message}</p>
                <div class="modal-merit">今日福报: <br><strong>${fortune}</strong></div>
                <button class="close-button">朕知道了</button>
            </div>
        `;
        modal.style.display = 'flex';
        modal.querySelector('.close-button').addEventListener('click', () => { 
            modal.style.display = 'none'; 
        });
        modal.addEventListener('click', (e) => { 
            if(e.target === modal) modal.style.display = 'none'; 
        });
    }
    
    // --- 初始化 ---
    renderDashboard();
    renderLeaderboard(); // 初始化时渲染排行榜
});
