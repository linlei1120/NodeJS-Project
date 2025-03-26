var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// import OpenAI from 'openai';
var OpenAI = require('openai');
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey:'sk-d34bdc13d7be48b79d7ac14309671a9b'
})
console.log("openai",openai);
async function mainChat() {
  // try {
    const completion = await openai.chat.completions.create({
      messages: [{role:'system',content:'You are a helpful assistant.'},{role:'system',content:'请给我一个冷笑话'}],
      model:'deepseek-chat'
    });
    console.log("AIAI", completion.choices[0].message.content);
  // } catch (error) {
  //   console.error('Error connecting to OpenAI API:', error);
  // }
}
// mainChat()
var connection = require('./config/server');
  // 查询 sys_user 表的所有记录
  connection.query('SELECT * FROM sys_user', function (error, results) {
    if (error) {
      console.error('Error fetching sys_user: ' + error.stack);
      return;
    }
    
    // 转换为指定格式的列表
    const formattedUsers = results.map(user => ({
      id: user.user_id, // 假设 sys_user 表中有 id 字段
      name: user.user_name, // 假设 sys_user 表中有 name 字段
      email: user.email // 假设 sys_user 表中有 email 字段
    }));
    console.log('Formatted Users List:');
    console.log(formattedUsers);
    // 关闭连接
    // connection.end();
  });
  
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// 根据 ID 查询用户信息的 API，使用 SSE 流式输出
app.post('/api/post-chat', async (req, res) => {
  const data = req.body;
  console.log("data", data);

  try {
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 调用 OpenAI API 获取流式响应
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: data.msg }],
      model: 'deepseek-chat',
      stream: true // 启用流式输出
    });

    // 监听流式数据
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ answer: content })}\n\n`);
      }
    }

    // 结束 SSE 流
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
  console.log("res", res);
    console.error('Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
    res.end();
  }
});
app.get('/api/chat/:msg',async function(req, res) {
  const msg = req.params.msg;
  console.log("msg",msg);
  const completion = await openai.chat.completions.create({
    messages: [{role:'system',content:'You are a helpful assistant.'},{role:'system',content:'请给我一个冷笑话'}],
    model:'deepseek-chat'
  });
  console.log("AIAI", completion.choices[0].message.content);
  res.json({"msg":completion.choices[0].message.content});
})
app.get('/api/users/:id', function(req, res) {
  const userId = req.params.id;
  console.log("userId",userId);
  
  // 查询 sys_user 表中的用户信息
  connection.query('SELECT * FROM sys_user WHERE user_id = ?', [userId], function(error, results) {
    if (error) {
      console.error('Error fetching user: ' + error.stack);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 返回用户信息
    const user = results[0];
    const formattedUser = user;

    res.json(formattedUser);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
