let poems = [];
let authors = [];

// 加载诗词和诗人数据
async function loadData() {
    try {
        const poemResponse = await fetch('data/poems.json');
        poems = await poemResponse.json();
        
        const authorResponse = await fetch('data/authors.json');
        authors = await authorResponse.json();
        
        displayPoemList();
        getRecitationStats();
        getThemeDistribution();
    } catch (error) {
        console.error("加载数据时出错:", error);
        alert("无法加载数据，请稍后重试。");
    }
}

// 显示诗词列表
function displayPoemList() {
    const poemsList = document.getElementById("poems");
    poemsList.innerHTML = "";
    poems.forEach(poem => {
        const li = document.createElement("li");
        li.textContent = `${poem.title} - ${poem.author} (${poem.dynasty})`;
        li.onclick = () => showPoemDetails(poem);
        poemsList.appendChild(li);
    });
}

// 显示诗词详情及其关联信息
function showPoemDetails(poem) {
    const details = document.getElementById("poem-details");
    details.innerHTML = `
        <h2>${poem.title}</h2>
        <p><strong>作者：</strong>${poem.author} (${poem.dynasty})</p>
        <p>${poem.content}</p>
    `;
    showAuthorDetails(poem.author);
    showRelatedPoems(poem);
    details.hidden = false;
}

// 显示诗人关系
function showAuthorDetails(author) {
    const authorData = authors.find(a => a.name === author);
    if (authorData) {
        let relationsHtml = "<h3>关系</h3><ul>";
        authorData.related_authors.forEach(rel => {
            relationsHtml += `<li>${rel.relationship}: ${rel.name}</li>`;
        });
        relationsHtml += "</ul>";
        document.getElementById("poem-details").innerHTML += relationsHtml;
    }
}

// 显示相似意境的诗词
function showRelatedPoems(poem) {
    if (poem.related_poems && poem.related_poems.length > 0) {
        let relatedHtml = "<h3>相似诗词</h3><ul>";
        poem.related_poems.forEach(rp => {
            relatedHtml += `<li>${rp}</li>`;
        });
        relatedHtml += "</ul>";
        document.getElementById("poem-details").innerHTML += relatedHtml;
    }
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

document.addEventListener("DOMContentLoaded", loadData);
