// 奥佛寺 v6.3 - 完整功能版本
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 初始化 Supabase ---
    const SUPABASE_URL = 'https://uwgskpwjjtncktqoxirx.supabase.co' // 替换成您自己的 URL
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Z3NrcHdqanRuY2t0cW94aXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODg1MjUsImV4cCI6MjA3NDY2NDUyNX0.k0RD5rqr2f1oHnkGVji60M0DUmzfh18C8M89zR7h2xgEY' // 替换成您自己的 Key

    const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log('Supabase 初始化成功!');

    // --- 2. 全局变量和数据 ---
    const heatData = [
        {"program":"HKU - CS","heat":92,"category":"理工","icon":"💻"},
        {"program":"HKUST - BA","heat":85,"category":"商科","icon":"📈"},
        {"program":"CUHK - MKT","heat":65,"category":"商科","icon":"🛒"},
        {"program":"CityU - DS","heat":35,"category":"理工","icon":"📊"},
        {"program":"PolyU - EIE","heat":55,"category":"理工","icon":"💡"},
        {"program":"HKU - Finance","heat":78,"category":"商科","icon":"💰"},
        {"program":"CUHK - GP", "heat":45, "category":"人文社科", "icon":"🌍"}
    ];
    
    const fortunes = ["出门捡到钱","刮中大彩票","偶像回你私信","体重轻了5斤","喜欢的人向你表白","干饭不用排队","论文一稿就过","DDL自动延长","水逆即刻退散","抽卡一发入魂"];
    
    // 功德排行榜数据
    let leaderboardData = [
        { name: "一心求佛的有钱人", merit: 98521 },
        { name: "卷王之王", merit: 76543 },
        { name: "Offer收割机", merit: 66666 },
        { name: "潜心修行的海王", merit: 54321 },
        { name: "施主您", merit: 0, isUser: true }, // 您的位置
        { name: "拜佛的咸鱼", merit: 12345 }
    ];

    // 元素获取
    const form = document.getElementById('application-form');
    const programInput = document.getElementById('program');
    const muyuBtn = document.getElementById('muyu-submit-btn');
    const muyuText = document.getElementById('muyu-text');
    const tableBody = document.querySelector('#cases-table tbody');
    const knockSound = document.getElementById('knock-sound');
    const leaderboardList = document.getElementById('leaderboard-list');
    let merit = 0;

// --- 3. 核心功能函数 ---

/**
 * 从 Supabase 获取所有案例并渲染到表格
 */
async function fetchAndRenderCases() {
    // 显示加载状态
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">正在从云端读取善缘...</td></tr>';
    
    // 从 'cases' 表读取数据，按创建时间降序排列
    const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('读取数据失败:', error);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">读取善缘失败，请刷新重试。</td></tr>';
        return;
    }

    // 清空表格，准备渲染新数据
    tableBody.innerHTML = '';
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">功德簿暂无记录，等待第一位有缘人。</td></tr>';
    } else {
        data.forEach(caseItem => {
            const newRow = tableBody.insertRow();
            let statusClass = '';
            if(caseItem.status === 'Offer') statusClass = 'status-offer';
            else if(caseItem.status === 'Interview') statusClass = 'status-interview';
            else statusClass = 'status-rejection';

            newRow.innerHTML = `
                <td>${caseItem.school}</td>
                <td>${caseItem.program}</td>
                <td><span class="status ${statusClass}">${caseItem.status}</span></td>
                <td class="fortune-cell">✨ ${caseItem.fortune} ✨</td>
            `;
        });
    }
}

/**
 * 处理表单提交，将数据写入 Supabase
 */
async function submitApplication() {
    const school = form.elements.school.value;
    const program = form.elements.program.value;
    const status = form.elements.status.value;
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];

    // 禁用按钮，防止重复提交
    muyuBtn.disabled = true;
    muyuText.textContent = '上报中...';

    // 向 'cases' 表插入新数据
    const { error } = await supabase
        .from('cases')
        .insert([
            { school, program, status, fortune: randomFortune }
        ]);

    if (error) {
        console.error('写入数据失败:', error);
        showFeedbackModal('Error', randomFortune);
    } else {
        console.log('写入成功!');
        showFeedbackModal(status, randomFortune);
        // 成功后，重新获取并渲染所有案例，实现实时更新
        await fetchAndRenderCases();
    }
    
    // 恢复按钮
    form.reset();
    muyuBtn.disabled = false;
    muyuText.textContent = '敲此积福';
}


// --- 4. 事件监听 ---
muyuBtn.addEventListener('click', () => {
    // 现在木鱼按钮只负责提交
    if (programInput.value.trim() !== '') {
        submitApplication();
    } else {
        // 提示用户填写
        alert('请先填写专业名称再提交善缘哦！');
    }
});

// 弹窗逻辑 (略作修改以处理错误情况)
function showFeedbackModal(status, fortune) {
    const modal = document.getElementById('feedback-modal');
    const feedbackMessages = {
        'Offer': { title: "恭喜！前程似锦！", message: "您的善缘已结善果！" },
        'Interview': { title: "吉兆！好运将至！", message: "面试是成功的序章！" },
        'Rejection': { title: "莫愁！福报在后！", message: "塞翁失马，焉知非福！" },
        'Error': { title: "发生错误", message: "提交失败，请检查网络或稍后再试。" }
    };
    const { title, message } = feedbackMessages[status] || feedbackMessages['Error'];
    modal.innerHTML = `<div class="modal-content"><h3>${title}</h3><p>${message}</p>${status !== 'Error' ? `<div class="modal-merit">今日福报: <br><strong>${fortune}</strong></div>` : ''}<button class="close-button">朕知道了</button></div>`;
    modal.style.display = 'flex';
    modal.querySelector('.close-button').addEventListener('click', () => { modal.style.display = 'none'; });
}

    // --- 5. 热度面板功能 ---
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
    
    // 筛选按钮事件
    document.getElementById('filter-container').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelector('.filter-btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderDashboard(e.target.dataset.filter);
        }
    });

    // --- 6. 功德排行榜功能 ---
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

    // --- 7. 页面初始化 ---
    // 页面加载后，立即从云端获取数据
    fetchAndRenderCases();
    renderDashboard();
    renderLeaderboard();
});