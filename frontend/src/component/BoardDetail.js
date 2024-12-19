import React, { useEffect, useState } from 'react'; // React 및 훅 임포트
import { useNavigate, useParams } from 'react-router-dom'; // URL 파라미터 및 페이지 이동을 위한 훅 임포트
import '../App.css'; // CSS 파일 임포트

// 게시글 상세보기 컴포넌트
function BoardDetail({ user }) {
    // URL 파라미터에서 게시글 번호를 가져옴
    const { boardNumber } = useParams();
    
    // 게시물, 오류 메시지, 수정 상태를 위한 상태 변수
    const [board, setBoard] = useState(null); // 게시물 데이터를 저장할 상태
    const [error, setError] = useState(null); // 오류 메시지를 저장할 상태
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부를 저장할 상태
    const [editedTitle, setEditedTitle] = useState(''); // 수정된 제목을 저장할 상태
    const [editedContent, setEditedContent] = useState(''); // 수정된 내용을 저장할 상태
    const navigate = useNavigate(); // 페이지 이동을 위한 훅

    // 컴포넌트가 마운트될 때 게시물을 가져오는 함수 실행
    useEffect(() => {
        const fetchBoard = async () => {
            try {
                // 서버에 해당 게시물 데이터를 요청
                const response = await fetch(`http://localhost:8080/boards/detail/${boardNumber}`);
                if (!response.ok) {
                    setError('게시물을 불러오는 중 오류가 발생했습니다.'); // 응답이 실패한 경우
                } else { 
                    const data = await response.json(); // 서버 응답을 JSON으로 변환
                    setBoard(data); // 게시물 데이터를 상태에 저장
                    setEditedTitle(data.boardTitle); // 게시물 제목을 수정 상태에 저장
                    setEditedContent(data.boardWrite); // 게시물 내용을 수정 상태에 저장
                }
            } catch (err) {
                setError('네트워크 오류가 발생했습니다.'); // 네트워크 오류 처리
            }
        };

        fetchBoard(); // 게시물 데이터를 가져오는 함수 호출
    }, [boardNumber]); // 게시물 번호가 변경될 때마다 재실행

    // 게시물 삭제 처리 함수
    const handleDelete = async () => {
        if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) { // 삭제 확인
            try {
                // 서버에 게시물 삭제 요청
                const response = await fetch(`http://localhost:8080/boards/delete/${boardNumber}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert('게시물이 삭제되었습니다.'); // 삭제 성공 시 알림
                    navigate('/boards'); // 게시물 목록 페이지로 이동
                } else {
                    alert('게시물 삭제에 실패했습니다.'); // 삭제 실패 시 알림
                }
            } catch (error) {
                alert('네트워크 오류로 게시물 삭제에 실패했습니다.'); // 네트워크 오류 처리
            }
        }
    };

    // 게시물 수정 처리 함수
    const handleEdit = async () => {
        if (isEditing) {
            // 수정 중인 상태에서 저장 버튼 클릭 시
            try {
                // 서버에 게시물 수정 요청
                const response = await fetch(`http://localhost:8080/boards/update/${boardNumber}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        boardTitle: editedTitle, // 수정된 제목
                        boardWrite: editedContent, // 수정된 내용
                    }),
                });

                if (response.ok) {
                    const updatedBoard = await response.json(); // 수정된 게시물 데이터
                    setBoard(updatedBoard); // 수정된 데이터를 상태에 저장
                    setIsEditing(false); // 수정 모드 종료
                    alert('게시물이 수정되었습니다.'); // 수정 성공 시 알림
                } else {
                    alert('게시물 수정에 실패했습니다.'); // 수정 실패 시 알림
                }
            } catch (error) {
                alert('네트워크 오류로 게시물 수정에 실패했습니다.'); // 네트워크 오류 처리
            }
        } else {
            setIsEditing(true); // 수정 모드로 전환
        }
    };

    // 오류가 발생한 경우 오류 메시지 표시
    if (error) {
        return <div>오류: {error}</div>;
    }

    // 게시물 데이터가 아직 로드되지 않았을 경우 로딩 메시지 표시
    if (!board) {
        return <div>로딩 중...</div>;
    }

    // 게시물 작성자 정보 처리
    const userNickname = board.user ? board.user.userNickname : '알 수 없음'; // 작성자의 닉네임
    const userId = board.user ? board.user.userId : null; // 작성자의 ID

    // 컴포넌트 렌더링
    return (
        <div>
            <h2>
                {isEditing ? (
	                    // 수정 모드일 경우 제목을 입력할 수 있는 input 필드 표시
	                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                    />
                ) : (
                    // 수정 모드가 아닐 경우 제목 표시
                    board.boardTitle
                )}
            </h2>

            <p>
                {isEditing ? (
                    // 수정 모드일 경우 내용을 입력할 수 있는 textarea 필드 표시
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                    />
                ) : (
                    // 수정 모드가 아닐 경우 내용 표시
                    board.boardWrite
                )}
            </p>

            {/* 작성자, 작성일, 수정일 표시 */}
            <p>작성자: {userNickname}</p>
            <p>작성일: {new Date(board.createdDate).toLocaleString()}</p>
            <p>수정일: {new Date(board.updatedDate).toLocaleString()}</p>

            {/* 현재 사용자가 게시물 작성자이거나 관리자일 경우 수정/삭제 버튼 표시 */}
            {(user && (userId === user.userId || user.userLevel >= 4)) && (
                <div>
                    <button onClick={handleEdit}>
                        {isEditing ? '저장' : '수정'}
                    </button>
                    <button onClick={handleDelete}>삭제</button>
                </div>
            )}
        </div>
    );
}

export default BoardDetail;
