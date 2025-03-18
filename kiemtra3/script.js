document.querySelector('nav a[href="#AI"]').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('ttnt-content').innerHTML = `
        <h2>Bài viết về Object trong JavaScript</h2>
        <p>Trong JavaScript, object là một cấu trúc dữ liệu cho phép bạn lưu trữ các cặp key-value. Nó là một phần quan trọng trong lập trình JavaScript.</p>
    `;
});