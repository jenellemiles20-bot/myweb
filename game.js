// game.js

// --- 1. 初始化变量 ---
let chances = 0; // 初始机会次数 (，设为0一开始就红了)
let typingTimer = null; // 用于存储打字机任务，防止文字错乱

// 检查剧本是否存在
if (typeof storyData === 'undefined') {
    alert("错误：找不到剧本文件 (story.js)。");
}

// --- 2. 工具函数：更新左上角显示 ---
function updateHud() {
    const display = document.getElementById('chance-display');
    // 防止报错：先检查元素是否存在
    if (display) {
        display.innerText = chances;
        
        // 变色逻辑：如果小于0变红，否则恢复默认颜色
        if (chances <= 0) {
            display.style.color = "red";
        } else {
            display.style.color = ""; 
        }
    }
}

// --- 3. 核心函数：显示剧情节点 ---
function showNode(nodeId) {
    const node = storyData[nodeId];
    
    // 如果找不到节点，报错并停止
    if (!node) {
        console.error("找不到节点:", nodeId);
        return;
    }

    if (typeof node.setChance !== 'undefined') {
        chances = node.setChance;
    }
    if (node.bg) {
        // 修改 CSS 变量 --bg-image
        // 这样背景图就会平滑地切换了
        document.documentElement.style.setProperty('--bg-image', `url('${node.bg}')`);
    }
    // 获取界面元素
    const textElement = document.getElementById('story-text');
    const optionsBox = document.getElementById('options-box');

    // 1. 刷新一下左上角的数字
    updateHud();

    // 2. 关键步骤：在打字前，先把下面的按钮清空！防止玩家手快乱点
    optionsBox.innerHTML = '';

    // 3. 启动打字机效果
    typeWriter(textElement, node.text);

    // 4. 延迟显示选项按钮 (0.5秒后显示)
    setTimeout(() => {
        // 为了安全，再次清空一下（确保不会重复添加按钮）
        optionsBox.innerHTML = ''; 
        
        node.options.forEach(option => {
            const btn = document.createElement('button');
            
            // 检查是否有增减
            let costText = "";
            if (option.change) {
                const sign = option.change > 0 ? "+" : ""; // 正数加加号
                costText = ` [抽卡机会 ${sign}${option.change}]`;
            }

            // 组合按钮文字
            btn.innerText = "> " + option.text + costText;
            
            // 绑定点击事件
            btn.onclick = function() {
                // 如果有数值变化，先计算
                if (option.change) {
                    chances = chances + option.change;
                    updateHud(); // 立即更新显示
                }
                // 跳转下一页
                showNode(option.next);
            };
            
            // 把按钮加到页面上
            optionsBox.appendChild(btn);
        });
    }, 500);
}

// --- 4. 核心函数：打字机效果 (防乱码版) ---
function typeWriter(element, text) {
    // 【关键修复】如果之前还在打字，立刻强行停止它！
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }

    element.innerText = ""; // 清空文字框
    let i = 0;
    const speed = 30; // 打字速度，越小越快

    function type() {
        if (i < text.length) {
            element.innerText += text.charAt(i);
            i++;
            // 把这次的定时器ID存起来，以便可以随时取消
            typingTimer = setTimeout(type, speed);
        } else {
            // 打完了，清空ID
            typingTimer = null;
        }
    }
    type();
}

// --- 5. 游戏启动 ---
// 页面加载完成后，先刷新一次数字，再开始游戏
updateHud();
showNode('start');