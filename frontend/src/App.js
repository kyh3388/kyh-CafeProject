import React, { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import BoardDetail from './component/BoardDetail';
import BoardList from './component/BoardList';
import CreatePost from './component/CreatePost';
import EditProfile from './component/EditProfile';
import FindId from './component/FindId';
import FindPassword from './component/FindPassword';
import Login from './component/login';
import MyPosts from './component/MyPosts';
import Register from './component/register';
import UserManagement from './component/UserManagement'; // 사용자 관리 페이지 컴포넌트 추가

// App 컴포넌트: 애플리케이션의 메인 컴포넌트
function App() {
    const [user, setUser] = useState(null); // 사용자 정보를 저장하는 상태
    const [postCount, setPostCount] = useState(0); // 사용자가 작성한 게시물 수를 저장하는 상태
    const [error, setError] = useState(null); // 에러 메시지를 저장하는 상태
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    // 컴포넌트가 처음 마운트될 때 사용자 정보를 가져오는 useEffect
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                // 사용자 정보 요청 API 호출
                const response = await fetch('http://localhost:8080/users/current-user', {
                    method: 'GET',
                    credentials: 'include', // 쿠키 포함
                });
    
                if (response.ok) {
                    const user = await response.json();
                    setUser(user); // 사용자 정보를 상태에 저장
                } else if (response.status === 401) {
                    setUser(null); // 인증되지 않은 경우 사용자 정보 초기화
                } else {
                    throw new Error('서버 응답에 문제가 있습니다.');
                }
            } catch (error) {
                console.error('사용자 정보를 가져오는 중 오류 발생:', error);
                setUser(null); // 오류 발생 시 사용자 정보 초기화
            }
        };
    
        fetchCurrentUser(); // 함수 호출
    }, []);
    
    // 사용자의 게시물 수를 가져오는 useEffect
    useEffect(() => {
        const fetchPostCount = async () => {
            if (user) { // 사용자가 로그인되어 있을 때만 실행
                try {
                    const response = await fetch(`http://localhost:8080/boards/count/${user.userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setPostCount(data); // 게시물 수 상태에 저장
                    } else {
                        throw new Error('게시글 개수를 불러오는 중 오류 발생');
                    }
                } catch (error) {
                    setError(error.message);
                    console.error('게시글 개수 가져오기 실패:', error);
                }
            }
        };
        fetchPostCount();
    }, [user]);

    return (
        <div className="container">
            {/* 헤더 영역 */}
            <header>
                <div className="home-link">홈 &gt;</div>
                <div className="banner">메인 배너</div>
            </header>

            {/* 사이드바 및 메인 페이지 구성 */}
            <aside className="aside-container">
                {/* 사용자 정보 및 카테고리 링크를 렌더링 */}
                <RenderAside user={user} setUser={setUser} postCount={postCount} error={error} />
                <div className="aside-section">
                    <ul className="category">
                        <li>카테고리</li>
                        <hr width="100%" color="black"></hr>
                        <Link to="/boards/category/all">전체게시판</Link><br />
                        <Link to="/boards/category/notice">공지게시판</Link><br />
                        <Link to="/boards/category/free">자유게시판</Link><br />
                        <Link to="/boards/category/questions">질문게시판</Link>
                    </ul>
                </div>
            </aside>

            {/* 메인 페이지 라우팅 설정 */}
            <main>
                <Routes>
                    <Route path="/" element={<BoardList category="all" user={user}/>} />
                    <Route path="/boards/category/:category" element={<BoardList user={user} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/find-id" element={<FindId />} />
                    <Route path="/find-password" element={<FindPassword />} />
                    <Route path="/boards/detail/:boardNumber" element={<BoardDetail user={user}/>} />
                    {user && ( // 사용자가 로그인한 경우에만 표시
                        <>
                            <Route path="/my-posts" element={<MyPosts user={user} />} />
                            <Route path="/edit-profile" element={<EditProfile user={user} />} />
                            <Route path="/create-post" element={<CreatePost user={user} />} />
                            {user.userLevel === 4 && ( // 사용자 레벨이 4인 경우에만 사용자 관리 페이지 접근 가능
                                <Route path="/user-management" element={<UserManagement />} />
                            )}
                        </>
                    )}
                </Routes>
            </main>
        </div>
    );
}

// 사이드바에 사용자 정보와 로그인, 로그아웃 등을 렌더링하는 컴포넌트
function RenderAside({ user, setUser, postCount, error }) {
    const navigate = useNavigate();

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8080/users/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                localStorage.removeItem('token'); // 로컬 스토리지에서 토큰 삭제
                setUser(null);
                alert('로그아웃 되었습니다.');
                navigate('/login'); // 로그인 페이지로 이동
            } else {
                throw new Error('로그아웃 실패');
            }
        } catch (error) {
            console.error('로그아웃 에러:', error);
        }
    };

    if (error) {
        return <div>오류 발생: {error}</div>; // 에러 발생 시 메시지 표시
    }

    return (
        <div className="aside-section">
            {/* 사용자가 로그인하지 않은 경우 */}
            {!user ? (
                <div className="login-section">
                    <ul className="login-menu">
                        <Link to="/login">로그인</Link><br />
                        <Link to="/register">회원가입</Link><br />
                        <Link to="/find-id">아이디 찾기</Link><br />
                        <Link to="/find-password">비밀번호 찾기</Link><br />
                    </ul>
                </div>
            ) : (
                <div className="user-info">
                    {user.userImage && (
                        <img
                            src={`data:image/jpeg;base64,${user.userImage}`}
                            alt="프로필 이미지"
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                        />
                    )}
                    <p>닉네임 : {user.userNickname}</p>
                    <p>아이디 : {user.userId}</p>
                    <p>레벨   : {user.userLevel}</p>
                    <Link to="/my-posts">내가 쓴 글</Link> {postCount} <br />
                    <Link to="/edit-profile">개인정보수정</Link>
                    {user.userLevel === 4 && (
                        <Link to="/user-management">사용자관리</Link> // 사용자 관리 링크
                    )}
                    <button onClick={handleLogout} className='logout-button'>로그아웃</button>
                </div>
            )}
        </div>
    );
}

export default App;
