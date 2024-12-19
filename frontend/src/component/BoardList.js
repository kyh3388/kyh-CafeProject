import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../App.css';

// 게시판 목록 컴포넌트
function BoardList({ user }) {  
    // 현재 URL에서 카테고리 파라미터를 가져옴 (기본값: "all")
    const { category = "all" } = useParams(); 
    // 게시물 목록, 오류 메시지, 페이지 및 검색 관련 상태 변수
    const [boards, setBoards] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
    const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
    const [searchCategory, setSearchCategory] = useState(category); // 검색에 사용될 카테고리
    const [selectedCategory, setSelectedCategory] = useState(category); // 검색 선택 카테고리
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    // 카테고리 ID를 한글 이름으로 변환하는 함수
    const getCategoryNameInKorean = (categoryId) => {
        switch (categoryId) {
            case 'all':
            case 1:
                return '전체';
            case 'free':
            case 2:
                return '자유';
            case 'questions':
            case 3:
                return '질문';
            case 'notice':
            case 4:
                return '공지';
            default:
                return '알 수 없음';
        }
    };

    // 게시물을 서버에서 가져오는 함수
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                // 선택된 카테고리에 따라 API 호출
                const response = await fetch(`http://localhost:8080/boards/category/${category}`);
                if (!response.ok) {
                    setError('서버에서 오류가 발생했습니다.');
                } else {
                    const data = await response.json();
                    setBoards(data); // 게시물 데이터 설정
                    setTotalPages(Math.ceil(data.length / 10)); // 페이지 수 계산
                }
            } catch (err) {
                setError('네트워크 오류가 발생했습니다.');
            }
        };
        fetchBoards(); // 게시물 데이터 가져오기
    }, [category]);

    // 검색 버튼 클릭 시 검색 카테고리를 설정하고 페이지 이동
    const handleSearch = () => {
        setSearchCategory(selectedCategory); 
        navigate(`/boards/category/${selectedCategory}`);
    };

    // 글쓰기 버튼 클릭 시 로그인 여부 확인 후 페이지 이동
    const handleCreatePost = () => {
        if (user) {
            navigate('/create-post'); 
        } else {
            alert('로그인이 필요합니다.'); 
            navigate('/login'); 
        }
    };

    // 오류가 발생한 경우 오류 메시지 표시
    if (error) {
        return <div>오류: {error}</div>;
    }

    // 게시물이 없는 경우 표시할 메시지
    if (boards.length === 0) {
        return <div>게시물이 없습니다.</div>;
    }

    // 공지사항과 기타 게시물을 분리
    const noticeBoards = boards.filter(board => board.boardCategory === 4); // 공지사항
    const otherBoards = boards.filter(board => board.boardCategory !== 4); // 기타 게시물

    // 기타 게시물을 최신순으로 정렬
    otherBoards.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));

    // 검색어가 포함된 게시물 필터링
    const filteredBoards = [...noticeBoards, ...otherBoards].filter(board =>
        board.boardTitle.includes(searchTerm) || board.boardWrite.includes(searchTerm)
    );

    // 현재 페이지에 표시할 게시물 목록을 슬라이싱
    const displayedBoards = filteredBoards.slice(currentPage * 10, (currentPage + 1) * 10);

    // 다음 페이지로 이동하는 함수
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    // 이전 페이지로 이동하는 함수
    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div>
            <h2>{getCategoryNameInKorean(category)} 게시판</h2>

            {/* 검색 기능 UI */}
            <div className="board-controls">
                {/* 카테고리 선택 드롭다운 */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="all">전체</option>
                    <option value="notice">공지</option>
                    <option value="questions">질문</option>
                    <option value="free">자유</option>
                </select>

                {/* 검색어 입력 필드 */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="검색어를 입력하세요"
                />
                <button onClick={handleSearch} className='create-post-button-container'>검색</button>

                {/* 글쓰기 버튼 (로그인한 사용자에게만 표시) */}
                <div className="create-post-button-container">
                    {user && <button onClick={handleCreatePost}>글쓰기</button>}
                </div>
            </div>                                                                                       
            
            {/* 게시물 목록 테이블 */}
            <table>
                <thead>
                    <tr className="list-up">
                        <th>번호</th>
                        <th>카테고리</th>
                        <th>제목</th>
                        <th>내용</th>
                        <th>업데이트 날짜</th>
                        <th>작성자</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedBoards.map((board) => (
                        <tr key={board.boardNumber} className={board.boardCategory === 4 ? 'notice-row' : ''}>
                            <td>{board.boardNumber}</td>
                            <td>{getCategoryNameInKorean(board.boardCategory)}</td>
                            <td>
                                <Link to={`/boards/detail/${board.boardNumber}`}>
                                    {board.boardTitle}
                                </Link>
                            </td>
                            <td>
                                <Link to={`/boards/detail/${board.boardNumber}`}>
                                    {board.boardWrite.substring(0, 10)}
                                </Link>
                            </td>
                            <td>{new Date(board.updatedDate).toLocaleString()}</td>
                            <td>{board.user?.userNickname}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이지네이션 컨트롤 */}
            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 0}>
                    이전 페이지
                </button>
                <span>{currentPage + 1} / {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
                    다음 페이지
                </button>
            </div>
        </div>
    );
}

export default BoardList;
