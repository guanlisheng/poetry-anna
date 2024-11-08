let poems = [];
let authors = [];

// 加载诗词和诗人数据
async function loadData() {
    try {
        const poemResponse = await fetch('data/poems.json');
        poems = await poemResponse.json();
        
        const authorResponse = await fetch('data/authors.json');
        authors = await authorResponse.json();
        
        displayPoemList(poems);
        getRecitationStats();
        getThemeDistribution();
    } catch (error) {
        console.error("加载数据时出错:", error);
        alert("无法加载数据，请稍后重试。");
    }
}

// 显示诗词列表
function displayPoemList(filteredPoems) {
    const poemsList = document.getElementById("poems");
    poemsList.innerHTML = "";
    poems.forEach((poem, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${poem.title} - ${poem.author} (${poem.dynasty})`;
        li.onclick = () => showPoemDetails(poem);
        poemsList.appendChild(li);
    });
}

// 显示诗词详情
function showPoemDetails(poem) {
    const details = document.getElementById("poem-details");

    // 按句分行显示，确保标点符号跟随在前一句之后
    const formattedContent = poem.content
        .split(/(。|！|？)/g)  // 按逗号、句号、感叹号和问号分割内容
        .reduce((acc, part, index, array) => {
            // 将标点符号与前面的文字合并，避免单独分行
            if (['。', '！', '？'].includes(part)) {
                acc[acc.length - 1] += part; // 把符号添加到前一句
            } else {
                acc.push(highlightText(part.trim(), currentSearchTerm)); // 高亮并添加新句子
            }
            return acc;
        }, [])
        .join('<br>');  // 每句换行

    details.innerHTML = ` 
        <h2>${poem.title}</h2>
        <p><strong>作者：</strong>
            <span class="clickable" onclick="showAuthorDetails('${poem.author}')">${poem.author}</span>
            (${poem.dynasty})
        </p>
        <p>${formattedContent}</p>
    `;
    showAuthorDetails(poem.author);
    showRelatedPoems(poem);
    details.hidden = false;
}

// 搜索并过滤诗词
let currentSearchTerm = "";
function searchPoems(term) {
    currentSearchTerm = term;
    const filteredPoems = poems.filter(poem => 
        poem.content.includes(term) || poem.title.includes(term)
    );
    displayPoemList(filteredPoems);
}

// 高亮搜索关键词
function highlightText(text, term) {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// 显示诗人关系
function showAuthorDetails(authorName) {
    const authorData = authors.find(a => a.name === authorName);
    const details = document.getElementById("poem-details");

    if (authorData) {
        let relationsHtml = "<h3>关系</h3><ul>";
        authorData.related_authors.forEach(rel => {
            relationsHtml += `<li>${rel.relationship}: <span class="clickable" onclick="showAuthorDetails('${rel.name}')">${rel.name}</span></li>`;
        });
        relationsHtml += "</ul>";
        details.innerHTML += relationsHtml;
    }
}

// 显示相似意境的诗词
function showRelatedPoems(poem) {
    if (poem.related_poems && poem.related_poems.length > 0) {
        let relatedHtml = "<h3>相似诗词</h3><ul>";
        poem.related_poems.forEach(rpTitle => {
            const relatedPoem = poems.find(p => p.title === rpTitle);
            if (relatedPoem) {
                relatedHtml += `<li><span class="clickable" onclick="showPoemDetails(findPoemByTitle('${relatedPoem.title}'))">${relatedPoem.title}</span></li>`;
            }
        });
        relatedHtml += "</ul>";
        document.getElementById("poem-details").innerHTML += relatedHtml;
    }
}

// 帮助函数：按标题查找诗词
function findPoemByTitle(title) {
    return poems.find(poem => poem.title === title);
}

// 背诵进度分析
function getRecitationStats() {
    const stats = poems.reduce((acc, poem) => {
        acc[poem.dynasty] = (acc[poem.dynasty] || 0) + 1;
        return acc;
    }, {});

    const statsHtml = Object.entries(stats).map(([dynasty, count]) =>
        `<li>${dynasty}: ${count} 首</li>`
    ).join("");

    document.getElementById("stats-section").innerHTML = `<h3>背诵进度（按朝代）</h3><ul>${statsHtml}</ul>`;
}

// 主题分布分析
function getThemeDistribution() {
    const themeStats = poems.reduce((acc, poem) => {
        poem.themes.forEach(theme => {
            acc[theme] = (acc[theme] || 0) + 1;
        });
        return acc;
    }, {});

    const themeHtml = Object.entries(themeStats).map(([theme, count]) =>
        `<li>${theme}: ${count} 首</li>`
    ).join("");

    document.getElementById("theme-stats-section").innerHTML = `<h3>背诵主题分布</h3><ul>${themeHtml}</ul>`;
}

// 创建热力图数据
function createHeatmapData() {
    // 示例数据统计：统计每个主题及其出现次数
    const themeCount = {};
    poems.forEach(poem => {
        poem.themes.forEach(theme => {
            themeCount[theme] = (themeCount[theme] || 0) + 1;
        });
    });

    // 转换为 ECharts 热力图所需格式
    const heatmapData = Object.entries(themeCount).map(([theme, count]) => [theme, count]);
    return heatmapData;
}

document.addEventListener("DOMContentLoaded", loadData);
