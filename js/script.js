const questions = await fetch('js/questions.json').then(res => res.json());
const nextBtn = document.querySelector('.nextBtn');
const doneBtn = document.querySelector('.doneBtn');
const graph = document.querySelector('.graph');
const score = 20;
let state = 'html';
let data = [
    {label: 'category1', value: 50, color: '#f00'},
    {label: 'category2', value: 100, color: '#0f0'},
    {label: 'category3', value: 75, color: '#00f'},
];
const getMaxValue = () => {
    let maxValue = -Infinity;
    for (const {value} of data) {
        value > maxValue ? maxValue = value : maxValue;
    }
    return maxValue;
}
const getRandomColor = () => {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for(let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
const getTotalScore = () => {
    const data = questions[state];
    let totalScore = 0;
    data.forEach(({_, answers}) => {
        answers.forEach(({_, isCorrect, isSelected}) => {
            totalScore = isCorrect && isSelected ? totalScore + 1 : totalScore;
        });
    });
    return totalScore;
}
const setData = (param = {}) => {
    data = [...data, param];
    renderQuestions();
}
const setState = () => {
    const data = Object.entries(questions);
    let nextState = '';
    data.forEach(([key, value], index) => {
        const [k, v] = data[index + 1] ?? data[index];
        if(state === key) {
            nextState = k;
            return;
        };
    });
    state = nextState;
}
const setBtn = () => {
    const data = Object.entries(questions);
    const [k, v] = data[data.length - 1];
    if(k !== state) return;
    nextBtn.classList.add('none');
    doneBtn.classList.remove('none');
}
const renderQuestions = () => {
    const title = document.querySelector('.title');
    const container = document.querySelector('.container');
    const data = questions[state];
    title.textContent = state;
    container.innerHTML = '';
    data.forEach(({question, answers}) => {
        const item = document.createElement('div');
        const q = document.createElement('div');
        const as = document.createElement('div');
        item.className = 'item';
        q.className = 'question';
        as.className = 'answers flex';
        q.textContent = question;
        answers.forEach(ele => {
            const {answer, isCorrect, isSelected} = ele;
            const a = document.createElement('div');
            a.className = 'answer';
            a.textContent = answer;
            as.appendChild(a);
            a.addEventListener('click', () => {
                const allAnswerArr =[...as.querySelectorAll('.answer')];
                allAnswerArr.forEach(e => e.classList.remove('selected'));
                a.classList.add('selected');
                answers.forEach(e => e.isSelected = false);
                ele.isSelected = true;
            });
        });
        item.append(q, as);
        container.appendChild(item);
    });
}
const renderBarGraph = (canvasId, data) => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const canvasWidth = 720;
    const canvasHeight = 405;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const [pt, pb, pl, pr] = [25, 25, 25, 25];
    const maxValue = getMaxValue();
    const maxHeight = canvasHeight - pt - pb;
    const rowGap = 10;
    const rowCount = maxValue / rowGap;
    const rowLimit = maxHeight / rowCount;

    for(let i = 0; i <= rowCount; i++) {
        const y = canvasHeight - pb - i * rowLimit;
        ctx.beginPath();
        ctx.moveTo(pl, y);
        ctx.lineTo(canvasWidth - pr, y);
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.fillText(rowGap * i, pl, y);
    }


    const length = data.length;
    const barWidth = 100;
    const px = 50;
    const maxWidth = canvasWidth - pl - pr - px * 2;
    const gap = (maxWidth - barWidth * length) / (length - 1);
    data.forEach(({label, value, color}, idx) => {
        const x = pl + px + (barWidth * idx) + (gap * idx);
        const y = maxHeight - maxHeight / maxValue * value;
        const width = barWidth;
        const height = maxHeight / maxValue * value;
        ctx.fillStyle = color;
        ctx.fillRect(x, y + pb, width, height);
    });
}
const renderLineGraph = (canvasId, data) => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const canvasWidth = 720;
    const canvasHeight = 405;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const [pt, pb, pl, pr] = [25, 25, 25, 25];
    const maxValue = getMaxValue();
    const maxHeight = canvasHeight - pt - pb;
    const rowGap = 10;
    const rowCount = maxValue / rowGap;
    const rowLimit = maxHeight / rowCount;
    for(let i = 0; i <= rowCount; i++) {
        const y = canvasHeight - pb - i * rowLimit 
        ctx.beginPath();
        ctx.moveTo(pl, y);
        ctx.lineTo(canvasWidth - pr, y);
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.fillText(rowGap * i, pl, y);
    }

    const length = data.length;
    const px = 50;
    const maxWidth = canvasWidth - pl - pr - px * 2;
    const gap = maxWidth / length - 1;
    data.forEach(({label, value, color}, idx) => {
        const x = canvasWidth - maxWidth + pl + gap * idx;
        const y = maxHeight - maxHeight / maxValue * value + pb;
        idx ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        ctx.stroke();
    });

    data.forEach(({label, value, color}, idx) => {
        const gap = maxWidth / data.length;
        const x = canvasWidth - maxWidth + pl + gap * idx;
        const y = maxHeight - maxHeight / maxValue * value + pb;
        const radius = 5;
        const startAngle = 0;
        const endAngle = Math.PI * 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.fill();
    })
}
const renderPolygonGraph = (canvasId, data) => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const canvasWidth = 720;
    const canvasHeight = 405;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const numberOfSides = data.length;
    const maxSize = 200;
    const Xcenter = canvasWidth / 2;
    const Ycenter = canvasHeight / 2;
    const step = Math.PI * 2 / numberOfSides;
    const shift = (Math.PI / 180.0) * 270;
    const maxValue = Math.ceil(getMaxValue() / 10) * 10;
    const gapCount = maxValue / 10;

    ctx.beginPath();
    for(let gap = 1; gap <= gapCount; gap++) {
        const size = maxSize / gapCount * gap;
        for (let i = 0; i <= numberOfSides; i++) {
            let curStep = i * step + shift;
            const x = Xcenter + size * Math.cos(curStep);
            const y = Ycenter + size * Math.sin(curStep);
            ctx.lineTo(x, y);
        }
        const Xtext = Xcenter + size * Math.cos(numberOfSides * step + shift);
        const Ytext = Ycenter + size * Math.sin(numberOfSides * step + shift);
        ctx.font = '12px sans-serif';
        ctx.fillText(gap * 10, Xtext + 5, Ytext + 25);
    }
    ctx.stroke();

    ctx.beginPath();
    data.forEach(({label, value, color}, idx) => {
        const size = maxSize / maxValue * value;
        let curStep = (idx + 1) * step + shift;
        const x = Xcenter + size * Math.cos(curStep);
        const y = Ycenter + size * Math.sin(curStep);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.lineTo(x, y);
    });
    ctx.fill();
}
const renderPieGraph = (canvasId, data) => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const canvasWidth = 720;
    const canvasHeight = 405;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const total = data.reduce((sum, point) => sum + point.value, 0);
    let startAngle = 0;

    data.forEach(point => {
        const sliceAngle = (2 * Math.PI * point.value) / total;

        ctx.beginPath();
        ctx.fillStyle = point.color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        const labelX = centerX + (radius / 2) * Math.cos(startAngle + sliceAngle / 2);
        const labelY = centerY + (radius / 2) * Math.sin(startAngle + sliceAngle / 2);
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(point.label, labelX - 20, labelY);

        startAngle += sliceAngle;
    });
}
const render = () => {
    renderBarGraph('bar', data);
    renderLineGraph('line', data);
    renderPolygonGraph('polygon', data);
    renderPieGraph('pie', data);
}
const onBtnClick = () => {
    const totalScore = getTotalScore();
    const qCnt = questions[state].length;
    const label = state;
    const value = totalScore * 100 / qCnt;
    const color = getRandomColor();
    const arg = {label, value, color};
    setState();
    setBtn();
    setData(arg);
}
const handleDoneBtnClick = () => {
    graph.classList.remove('none');
    onBtnClick();
    render();
}
const evt = () => {
    nextBtn.addEventListener('click', onBtnClick);
    doneBtn.addEventListener('click', handleDoneBtnClick);
}
const init = () => {
    evt();
    renderQuestions();
    render();
}
init();