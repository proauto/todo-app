//서버 오픈하는 기본 문법
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method')) 

var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.dwqfqrz.mongodb.net/?retryWrites=true&w=majority',function(에러, client){
   
    //연결되면 할일
    if(에러) return console.log(에러)

    db = client.db('todoapp');


    app.listen(8080, function(){
        console.log('listening on 8080')
    });
});


//누군가가 pet으로 방문하면 pet 관련된 안내문을 띄워주자.
app.get('/pet',(요청, 응답) =>{
    응답.send('펫용품 쇼핑할 수 있는 페이지입니다.');

});

app.get('/beauty',(요청, 응답) => {
    응답.send('뷰티용품 쇼핑할 수 있는 페이지입니다.');
});

app.get('/',(요청, 응답) => {
    응답.render('index.ejs',);
});

app.get('/write', (요청, 응답) => { 
    응답.render('write.ejs',);
  });

//어떤 사람이 add 경로로 POST 요청을 하면 데이터 2개(날짜, 제목을 보내주는데
//이 때 'post''라는 이름을 가진 collection에 저장하기
app.post('/add', (요청, 응답) =>{
    응답.send('전송완료')
    
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
        console.log(결과.totalPost)

        var 총게시물갯수 = 결과.totalPost;
        
        db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목  : 요청.body.title , 날짜 : 요청.body.date},function(에러,결과){
            console.log('저장완료');
            //counter라는 콜렉션에 있는 totalPost 항목을 1증가(수정)
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1}},function(에러, 결과){
                if(에러) return console.log(에러)
            })
        });

        
    });
});

//DB 데이터 꺼내기
app.get('/list', (요청, 응답) => { 

    db.collection('post').find().toArray(function(에러, 결과){
        console.log(결과);
        응답.render('list.ejs', {posts : 결과 });
    });

});

app.delete('/delete',function(요청, 응답){
    console.log(요청.body)
    요청.body._id = parseInt(요청.body._id)
    //요청.body에 담겨온 게시물번호를 가진 글을 DB에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(요청.body, function(){
        console.log('삭제완료');
        응답.status(200).send({ message : '성공했습니다'});
    })
})

app.get('/detail/:id', function(요청, 응답){
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
      응답.render('detail.ejs', {data : 결과} )
    })
  });

app.get('/edit/:id',function(요청,응답){
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
    응답.render('edit.ejs', {post : 결과} )
    })
});

app.put('/edit', function(요청, 응답){
    //폼에 담긴 제목 날짜 데이터를 가지고 db를 업데이트함
    
    db.collection('post').updateOne({ _id : parseInt(요청.body.id)},{$set : {제목 : 요청.body.title, 날짜 : 요청.body.date}},function(에러, 결과){
        console.log('수정완료')
        응답.redirect('/list')
    });

});