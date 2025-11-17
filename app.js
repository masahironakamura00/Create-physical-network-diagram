// ノードの定義
const NODE_TYPES = {
    smartphone: {
        id: 'smartphone',
        name: 'スマートフォン',
        emoji: '📱',
        imagePath: './diagrams/スマホ.png',
        category: '携帯デバイス'
    },
    tablet: {
        id: 'tablet',
        name: 'タブレット',
        emoji: '📱',
        imagePath: './diagrams/タブレット.png',
        category: '携帯デバイス'
    },
    wearable: {
        id: 'wearable',
        name: 'ウェアラブル',
        emoji: '⌚',
        imagePath: './diagrams/ウェアラブルテクノロジー.png',
        category: '携帯デバイス'
    },
    baseStation1: {
        id: 'baseStation1',
        name: '小型基地局',
        emoji: '📡',
        imagePath: './diagrams/小型基地局.png',
        category: '通信インフラ'
    },
    baseStation2: {
        id: 'baseStation2',
        name: '鉄塔基地局',
        emoji: '📡',
        imagePath: './diagrams/鉄塔基地局.png',
        category: '通信インフラ'
    },
    satellite: {
        id: 'satellite',
        name: '人工衛星',
        emoji: '🛰️',
        imagePath: './diagrams/人工衛星.png',
        category: '通信インフラ'
    },
    router: {
        id: 'router',
        name: 'ルーター',
        emoji: '🔀',
        imagePath: './diagrams/ルーター.png',
        category: 'ネットワークデバイス'
    },
    wifiRouter: {
        id: 'wifiRouter',
        name: 'Wi-Fiアクセスポイント',
        emoji: '📶',
        imagePath: './diagrams/wi-fiルーター.png',
        category: 'ネットワークデバイス'
    },
    server: {
        id: 'server',
        name: 'サーバー',
        emoji: '🖥️',
        imagePath: './diagrams/サーバー.png',
        category: 'サーバー・ストレージ'
    },
    lineserver: {
        id: 'lineserver',
        name: 'Lineサーバー',
        emoji: '🖥️',
        imagePath: './diagrams/Lineサーバー.png',
        category: 'サーバー・ストレージ'
    },
    softbanknetworkCenter: {
        id: 'softbanknetworkCenter',
        name: 'softbankネットワークセンター',
        emoji: '🖥️',
        imagePath: './diagrams/Softbankネットワークセンター.png',
        category: 'サーバー・ストレージ'
    },
    rakutennetworkCenter: {
        id:'rakutennetworkCenter',
        name: '楽天ネットワークセンター',
        emoji: '🖥️',
        imagePath: './diagrams/楽天モバイルネットワークセンター.png',
        category: 'サーバー・ストレージ'
    },
    kddinetworkCenter: {
        id: 'kddinetworkCenter',
        name: 'kddiネットワークセンター',
        emoji: '🖥️',
        imagePath: './diagrams/KDDIネットワークセンター.png',
        category: 'サーバー・ストレージ'
    },
    dataCenter: {
        id: 'dataCenter',
        name: 'データセンター',
        emoji: '🏢',
        imagePath: './diagrams/サーバー.png',
        category: 'サーバー・ストレージ'
    },
    googledataCenter: {
        id: 'googledataCenter',
        name: 'Googleデータセンター',
        emoji: '🏢',
        imagePath: './diagrams/Googleデータセンター.png',
        category: 'サーバー・ストレージ'
    },
    cloud: {
        id: 'cloud',
        name: 'クラウド',
        emoji: '☁️',
        imagePath: './diagrams/クラウド.png',
        category: 'クラウド・インターネット'
    },
    internet: {
        id: 'internet',
        name: 'インターネット',
        emoji: '🌐',
        imagePath: './diagrams/インターネット.png',
        category: 'クラウド・インターネット'
    }
};

// アプリケーション状態
class NetworkApp {
    constructor() {
        this.networkNodes = []; // ネットワーク図に追加されたノード
        this.connections = []; // ノード間の接続情報
        this.nodeIdCounter = 0;
        this.connectionIdCounter = 0;
        this.maxNodesInDiagram = 20; // ネットワーク図の最大ノード数
        this.svg = null;
        this.nodeWidth = 80;
        this.nodeHeight = 80;
        // 接続作成用の状態
        this.isCreatingConnection = false;
        this.connectionStartNodeId = null;
        this.previewLine = null;
        // タッチ用の状態
        this.touchLongPressTimer = null;
        this.touchStartTime = 0;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.init();
    }

    init() {
        this.setupUI();
        this.setupEventListeners();
        this.redrawDiagram();
    }

    setupUI() {
        this.renderNodeList();
    }

    renderNodeList() {
        const nodeListElement = document.getElementById('nodeList');
        nodeListElement.innerHTML = '';

        const isDisabled = this.networkNodes.length >= this.maxNodesInDiagram;

        Object.values(NODE_TYPES).forEach(nodeType => {
            const nodeItem = document.createElement('div');
            nodeItem.className = `node-item-icon ${isDisabled ? 'disabled' : ''}`;
            nodeItem.title = nodeType.name;
            nodeItem.innerHTML = `
                <img src="${nodeType.imagePath}" alt="${nodeType.name}" onerror="this.textContent='${nodeType.emoji}'">
            `;

            if (!isDisabled) {
                // ドラッグ可能にする
                nodeItem.draggable = true;

                // ドラッグ開始時にノードタイプを保存
                nodeItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('nodeType', JSON.stringify(nodeType));
                });

                // クリックでも追加できるようにする
                nodeItem.addEventListener('click', () => this.addNodeToDiagram(nodeType));
            }

            nodeListElement.appendChild(nodeItem);
        });

        // ノード数バッジを更新
        this.updateNodeCountBadge();
    }

    updateNodeCountBadge() {
        const badge = document.getElementById('nodeCountBadge');
        if (badge) {
            badge.textContent = `${this.networkNodes.length}/${this.maxNodesInDiagram}`;
        }
    }

    addNodeToDiagram(nodeType, x = null, y = null) {
        if (this.networkNodes.length >= this.maxNodesInDiagram) {
            alert(`最大${this.maxNodesInDiagram}個のノードまで追加できます`);
            return;
        }

        const newNode = {
            id: `node-${this.nodeIdCounter++}`,
            type: nodeType.id,
            typeData: nodeType,
            x: x !== null ? x : 0,
            y: y !== null ? y : 0,
            hasCustomPosition: x !== null && y !== null // カスタム位置が指定されたかどうかを追跡
        };

        this.networkNodes.push(newNode);
        this.renderNodeList();
        this.redrawDiagram();
    }

    createConnection(fromNodeId, toNodeId) {
        const connection = {
            id: `conn-${this.connectionIdCounter++}`,
            fromNodeId: fromNodeId,
            toNodeId: toNodeId,
            isWireless: true // デフォルトは無線（破線）
        };
        this.connections.push(connection);
    }

    removeNodeFromDiagram(nodeId) {
        // ノードを削除
        this.networkNodes = this.networkNodes.filter(n => n.id !== nodeId);

        // そのノードに関連する接続を削除
        this.connections = this.connections.filter(conn =>
            conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
        );

        this.renderNodeList();
        this.redrawDiagram();
    }

    toggleConnectionType(connectionId) {
        const connection = this.connections.find(c => c.id === connectionId);
        if (connection) {
            connection.isWireless = !connection.isWireless;
            this.redrawDiagram();
        }
    }

    redrawDiagram() {
        this.svg = document.getElementById('networkDiagram');
        this.svg.innerHTML = '';

        // ノードの位置を計算
        this.calculateNodePositions();

        // 背景グリッド描画
        this.drawGrid();

        // ノード同士の接続線を描画
        if (this.connections.length > 0) {
            this.drawConnections();
        }

        // ノードを描画
        this.networkNodes.forEach(node => {
            this.drawNode(node);
        });

        // ノードが0個の場合、メッセージを表示
        if (this.networkNodes.length === 0) {
            const emptyMessage = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            emptyMessage.setAttribute('x', '50%');
            emptyMessage.setAttribute('y', '50%');
            emptyMessage.setAttribute('text-anchor', 'middle');
            emptyMessage.setAttribute('dominant-baseline', 'middle');
            emptyMessage.setAttribute('font-size', '18');
            emptyMessage.setAttribute('fill', '#94a3b8');
            emptyMessage.textContent = 'ノード一覧からノードを追加してください';
            this.svg.appendChild(emptyMessage);
        }
    }

    calculateNodePositions() {
        const cols = 4; // 最大4列に配置
        const svgWidth = 1200;
        const svgHeight = 900;
        const horizontalSpacing = svgWidth / (cols + 1);

        // カスタム位置を持たないノードのインデックスを取得
        const nodesWithoutPosition = this.networkNodes
            .map((node, index) => ({ node, index }))
            .filter(({ node }) => !node.hasCustomPosition);

        // ノード数に応じて行数を計算し、均等に配置
        const rows = Math.ceil(nodesWithoutPosition.length / cols);
        const verticalSpacing = svgHeight / (rows + 1);

        let positionIndex = 0;
        this.networkNodes.forEach((node) => {
            // カスタム位置を持つノードは位置を変更しない
            if (!node.hasCustomPosition) {
                const row = Math.floor(positionIndex / cols);
                const col = positionIndex % cols;

                node.x = horizontalSpacing * (col + 1);
                node.y = verticalSpacing * (row + 1);
                positionIndex++;
            }
        });
    }

    drawGrid() {
        const gridSize = 100;
        const width = 1200;
        const height = 900;

        // 縦線
        for (let x = 0; x <= width; x += gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', '#e2e8f0');
            line.setAttribute('stroke-width', '0.5');
            this.svg.appendChild(line);
        }

        // 横線
        for (let y = 0; y <= height; y += gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e2e8f0');
            line.setAttribute('stroke-width', '0.5');
            this.svg.appendChild(line);
        }
    }

    drawConnections() {
        // チェーン状の接続を描画
        this.connections.forEach((connection, index) => {
            const fromNode = this.networkNodes.find(n => n.id === connection.fromNodeId);
            const toNode = this.networkNodes.find(n => n.id === connection.toNodeId);

            if (!fromNode || !toNode) return;

            // 同じノードペア間の接続数をカウント
            const sameNodePairConnections = this.connections.filter(conn => {
                return (conn.fromNodeId === connection.fromNodeId && conn.toNodeId === connection.toNodeId) ||
                       (conn.fromNodeId === connection.toNodeId && conn.toNodeId === connection.fromNodeId);
            });

            const totalConnections = sameNodePairConnections.length;
            const connectionIndex = sameNodePairConnections.findIndex(conn => conn.id === connection.id);

            // オフセット値を計算（複数接続がある場合、左右にずらす）
            const offsetDistance = 5; // ピクセル
            const offset = (connectionIndex - (totalConnections - 1) / 2) * offsetDistance;

            // 線の方向ベクトルを計算
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length === 0) return; // ノードが同じ位置の場合はスキップ

            // 垂直なベクトル（単位ベクトル）
            const perpX = -dy / length;
            const perpY = dx / length;

            // オフセットを適用した座標
            const x1 = fromNode.x + perpX * offset;
            const y1 = fromNode.y + perpY * offset;
            const x2 = toNode.x + perpX * offset;
            const y2 = toNode.y + perpY * offset;

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'connection');
            group.setAttribute('data-connection-id', connection.id);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', '#cbd5e1');
            line.setAttribute('stroke-width', '2');

            // 無線（破線）か有線（実線）かで表示を変える
            if (connection.isWireless) {
                line.setAttribute('stroke-dasharray', '5,5');
            }

            line.setAttribute('pointer-events', 'stroke');
            line.setAttribute('class', 'connection-line');
            line.setAttribute('cursor', 'pointer');

            // 線のクリックイベント
            line.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleConnectionType(connection.id);
            });

            group.appendChild(line);
            this.svg.appendChild(group);
        });
    }

    drawNode(node) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'network-node');
        group.setAttribute('data-node-id', node.id);

        // ノードの背景円（外側 - 影）
        const shadowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shadowCircle.setAttribute('cx', node.x);
        shadowCircle.setAttribute('cy', node.y);
        shadowCircle.setAttribute('r', '52');
        shadowCircle.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
        shadowCircle.setAttribute('filter', 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.2))');
        group.appendChild(shadowCircle);

        // ノードの背景円（メイン）
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '50');
        circle.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
        circle.setAttribute('stroke', '#3b82f6');
        circle.setAttribute('stroke-width', '2.5');
        group.appendChild(circle);

        // ノードの画像
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('x', node.x - 30);
        image.setAttribute('y', node.y - 30);
        image.setAttribute('width', '60');
        image.setAttribute('height', '60');
        image.setAttribute('href', node.typeData.imagePath);
        image.addEventListener('error', () => {
            // 画像読み込み失敗時は絵文字で代替
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('font-size', '36');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.textContent = node.typeData.emoji;
            group.appendChild(text);
            group.removeChild(image);
        });
        group.appendChild(image);

        // ノード名テキスト
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 55);
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#1e293b');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-weight', '600');
        text.textContent = node.typeData.name;
        group.appendChild(text);

        // ドラッグ機能
        let isDragging = false;
        let hasMoved = false; // 実際に移動したかを追跡
        let isCreatingConnection = false; // 接続作成モード
        let startX = 0;
        let startY = 0;
        let nodeStartX = node.x;
        let nodeStartY = node.y;
        let currentOffsetX = 0;
        let currentOffsetY = 0;

        const handleMouseDown = (e) => {
            // 右クリックは削除機能
            if (e.button === 2 || e.ctrlKey || e.metaKey) {
                return;
            }
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            nodeStartX = node.x;
            nodeStartY = node.y;
            currentOffsetX = 0;
            currentOffsetY = 0;

            // ドラッグ対象がノード周囲の枠（circle）の場合は接続作成モード
            if (e.target === circle || e.target === shadowCircle) {
                isCreatingConnection = true;
            }

            // ドラッグ中のスタイルを変更
            circle.setAttribute('stroke', '#2563eb');
            circle.setAttribute('stroke-width', '3.5');
            group.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;

            const svg = this.svg;
            const svgRect = svg.getBoundingClientRect();

            // マウス移動距離を計算
            const screenDX = e.clientX - startX;
            const screenDY = e.clientY - startY;

            // 5px以上移動したら実際のドラッグと判定
            if (Math.abs(screenDX) > 5 || Math.abs(screenDY) > 5) {
                hasMoved = true;
            }

            // SVGの座標系に変換
            const viewBox = svg.getAttribute('viewBox').split(' ');
            const viewBoxWidth = parseFloat(viewBox[2]);
            const viewBoxHeight = parseFloat(viewBox[3]);

            currentOffsetX = (screenDX / svgRect.width) * viewBoxWidth;
            currentOffsetY = (screenDY / svgRect.height) * viewBoxHeight;

            if (isCreatingConnection && hasMoved) {
                // 接続作成モード：プレビュー線を描画
                if (!this.previewLine) {
                    this.previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.previewLine.setAttribute('stroke', '#f97316');
                    this.previewLine.setAttribute('stroke-width', '2');
                    this.previewLine.setAttribute('stroke-dasharray', '5,5');
                    this.previewLine.setAttribute('pointer-events', 'none');
                    svg.appendChild(this.previewLine);
                }
                const mouseX = e.clientX - svgRect.left;
                const mouseY = e.clientY - svgRect.top;
                const viewBoxX = parseFloat(viewBox[0]);
                const viewBoxY = parseFloat(viewBox[1]);
                const svgMouseX = viewBoxX + (mouseX / svgRect.width) * viewBoxWidth;
                const svgMouseY = viewBoxY + (mouseY / svgRect.height) * viewBoxHeight;

                this.previewLine.setAttribute('x1', node.x);
                this.previewLine.setAttribute('y1', node.y);
                this.previewLine.setAttribute('x2', svgMouseX);
                this.previewLine.setAttribute('y2', svgMouseY);

                // ノードをハイライト（接続可能なノードを示す）
                this.networkNodes.forEach(otherNode => {
                    if (otherNode.id !== node.id) {
                        const otherGroup = svg.querySelector(`[data-node-id="${otherNode.id}"]`);
                        if (otherGroup) {
                            const otherCircle = otherGroup.querySelector('circle:first-of-type');
                            if (otherCircle) {
                                const dist = Math.sqrt(
                                    Math.pow(svgMouseX - otherNode.x, 2) +
                                    Math.pow(svgMouseY - otherNode.y, 2)
                                );
                                if (dist < 70) { // ノード付近
                                    otherCircle.setAttribute('fill', 'rgba(34, 197, 94, 0.3)');
                                    otherCircle.setAttribute('stroke', '#22c55e');
                                } else {
                                    otherCircle.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
                                    otherCircle.setAttribute('stroke', '#3b82f6');
                                }
                            }
                        }
                    }
                });
            } else {
                // 通常のドラッグ：ノードを移動
                group.setAttribute('transform', `translate(${currentOffsetX}, ${currentOffsetY})`);
            }
        };

        const handleMouseUp = (e) => {
            if (isDragging) {
                isDragging = false;
                // スタイルを戻す
                circle.setAttribute('stroke', '#3b82f6');
                circle.setAttribute('stroke-width', '2.5');
                group.style.cursor = 'pointer';

                if (isCreatingConnection && hasMoved) {
                    // 接続作成モード：マウス位置のノードを検索
                    const svg = this.svg;
                    const svgRect = svg.getBoundingClientRect();
                    const mouseX = e.clientX - svgRect.left;
                    const mouseY = e.clientY - svgRect.top;
                    const viewBox = svg.getAttribute('viewBox').split(' ');
                    const viewBoxX = parseFloat(viewBox[0]);
                    const viewBoxY = parseFloat(viewBox[1]);
                    const viewBoxWidth = parseFloat(viewBox[2]);
                    const viewBoxHeight = parseFloat(viewBox[3]);
                    const svgMouseX = viewBoxX + (mouseX / svgRect.width) * viewBoxWidth;
                    const svgMouseY = viewBoxY + (mouseY / svgRect.height) * viewBoxHeight;

                    // ドロップ位置に最も近いノードを探す
                    let targetNode = null;
                    let minDist = 70; // ノードの半径より少し大きい
                    this.networkNodes.forEach(otherNode => {
                        if (otherNode.id !== node.id) {
                            const dist = Math.sqrt(
                                Math.pow(svgMouseX - otherNode.x, 2) +
                                Math.pow(svgMouseY - otherNode.y, 2)
                            );
                            if (dist < minDist) {
                                minDist = dist;
                                targetNode = otherNode;
                            }
                        }
                    });

                    // 接続を作成
                    if (targetNode) {
                        this.createConnection(node.id, targetNode.id);
                        this.redrawDiagram();
                    }

                    // プレビュー線を削除
                    if (this.previewLine && this.previewLine.parentNode) {
                        this.previewLine.parentNode.removeChild(this.previewLine);
                        this.previewLine = null;
                    }

                    // ノードのハイライトをリセット
                    this.networkNodes.forEach(otherNode => {
                        const otherGroup = svg.querySelector(`[data-node-id="${otherNode.id}"]`);
                        if (otherGroup) {
                            const otherCircle = otherGroup.querySelector('circle:first-of-type');
                            if (otherCircle) {
                                otherCircle.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
                                otherCircle.setAttribute('stroke', '#3b82f6');
                            }
                        }
                    });

                    isCreatingConnection = false;
                } else if (hasMoved && !isCreatingConnection) {
                    // 通常のドラッグ：ノードを移動
                    node.x = nodeStartX + currentOffsetX;
                    node.y = nodeStartY + currentOffsetY;
                    node.hasCustomPosition = true;
                    this.redrawDiagram();
                }

                // プレビュー線があれば削除
                if (this.previewLine && this.previewLine.parentNode) {
                    this.previewLine.parentNode.removeChild(this.previewLine);
                    this.previewLine = null;
                }
            }
        };

        group.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // タッチイベント（ロングプレス+ドラッグで接続作成）
        const app = this;
        let isTouchDragging = false;
        let touchCurrentOffsetX = 0;
        let touchCurrentOffsetY = 0;

        const handleTouchStart = (e) => {
            if (e.touches.length !== 1) return; // シングルタッチのみ対応

            const touch = e.touches[0];
            app.touchStartTime = Date.now();
            app.touchStartX = touch.clientX;
            app.touchStartY = touch.clientY;

            // タッチ開始位置がノード周囲の枠（半径45-60px）かどうかを判定
            const svg = app.svg;
            const svgRect = svg.getBoundingClientRect();
            const viewBox = svg.getAttribute('viewBox').split(' ');
            const viewBoxX = parseFloat(viewBox[0]);
            const viewBoxY = parseFloat(viewBox[1]);
            const viewBoxWidth = parseFloat(viewBox[2]);
            const viewBoxHeight = parseFloat(viewBox[3]);

            const svgTouchX = viewBoxX + (touch.clientX - svgRect.left) / svgRect.width * viewBoxWidth;
            const svgTouchY = viewBoxY + (touch.clientY - svgRect.top) / svgRect.height * viewBoxHeight;

            const distFromCenter = Math.sqrt(
                Math.pow(svgTouchX - node.x, 2) +
                Math.pow(svgTouchY - node.y, 2)
            );

            // タッチがノード周囲の枠（半径45-60px）であれば接続作成の対象
            const isCircleArea = distFromCenter >= 40 && distFromCenter <= 55;

            // ロングプレス検出用タイマー（500ms）
            if (isCircleArea) {
                app.touchLongPressTimer = setTimeout(() => {
                    isTouchDragging = true;
                    isCreatingConnection = true;
                    hasMoved = false;
                    touchCurrentOffsetX = 0;
                    touchCurrentOffsetY = 0;

                    // ドラッグ中のスタイルを変更
                    circle.setAttribute('stroke', '#2563eb');
                    circle.setAttribute('stroke-width', '3.5');
                    group.style.cursor = 'grabbing';

                    // ホールドバイブレーション（サポートされている場合）
                    if (navigator.vibrate) {
                        navigator.vibrate(100);
                    }
                }, 500);
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const screenDX = touch.clientX - app.touchStartX;
            const screenDY = touch.clientY - app.touchStartY;

            // タッチが5px以上移動したらロングプレスキャンセル
            if (Math.abs(screenDX) > 5 || Math.abs(screenDY) > 5) {
                if (app.touchLongPressTimer) {
                    clearTimeout(app.touchLongPressTimer);
                    app.touchLongPressTimer = null;
                }
            }

            if (isTouchDragging) {
                const svg = app.svg;
                const svgRect = svg.getBoundingClientRect();

                // SVGの座標系に変換
                const viewBox = svg.getAttribute('viewBox').split(' ');
                const viewBoxWidth = parseFloat(viewBox[2]);
                const viewBoxHeight = parseFloat(viewBox[3]);

                touchCurrentOffsetX = (screenDX / svgRect.width) * viewBoxWidth;
                touchCurrentOffsetY = (screenDY / svgRect.height) * viewBoxHeight;

                if (isCreatingConnection) {
                    // 接続作成モード：プレビュー線を描画
                    if (!app.previewLine) {
                        app.previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        app.previewLine.setAttribute('stroke', '#f97316');
                        app.previewLine.setAttribute('stroke-width', '2');
                        app.previewLine.setAttribute('stroke-dasharray', '5,5');
                        app.previewLine.setAttribute('pointer-events', 'none');
                        svg.appendChild(app.previewLine);
                    }

                    const viewBoxX = parseFloat(viewBox[0]);
                    const viewBoxY = parseFloat(viewBox[1]);
                    const svgMouseX = viewBoxX + (touch.clientX - svgRect.left) / svgRect.width * viewBoxWidth;
                    const svgMouseY = viewBoxY + (touch.clientY - svgRect.top) / svgRect.height * viewBoxHeight;

                    app.previewLine.setAttribute('x1', node.x);
                    app.previewLine.setAttribute('y1', node.y);
                    app.previewLine.setAttribute('x2', svgMouseX);
                    app.previewLine.setAttribute('y2', svgMouseY);

                    // ノードをハイライト
                    app.networkNodes.forEach(otherNode => {
                        if (otherNode.id !== node.id) {
                            const otherGroup = svg.querySelector(`[data-node-id="${otherNode.id}"]`);
                            if (otherGroup) {
                                const otherCircle = otherGroup.querySelector('circle:first-of-type');
                                if (otherCircle) {
                                    const dist = Math.sqrt(
                                        Math.pow(svgMouseX - otherNode.x, 2) +
                                        Math.pow(svgMouseY - otherNode.y, 2)
                                    );
                                    if (dist < 70) {
                                        otherCircle.setAttribute('fill', 'rgba(34, 197, 94, 0.3)');
                                        otherCircle.setAttribute('stroke', '#22c55e');
                                    } else {
                                        otherCircle.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
                                        otherCircle.setAttribute('stroke', '#3b82f6');
                                    }
                                }
                            }
                        }
                    });

                    if (Math.abs(screenDX) > 5 || Math.abs(screenDY) > 5) {
                        hasMoved = true;
                    }
                }

                e.preventDefault();
            }
        };

        const handleTouchEnd = (e) => {
            // ロングプレスタイマークリア
            if (app.touchLongPressTimer) {
                clearTimeout(app.touchLongPressTimer);
                app.touchLongPressTimer = null;
            }

            if (isTouchDragging) {
                isTouchDragging = false;
                // スタイルを戻す
                circle.setAttribute('stroke', '#3b82f6');
                circle.setAttribute('stroke-width', '2.5');
                group.style.cursor = 'pointer';

                if (isCreatingConnection && hasMoved) {
                    // 接続作成モード：タッチ位置のノードを検索
                    const svg = app.svg;
                    const svgRect = svg.getBoundingClientRect();
                    const touch = e.changedTouches[0];
                    const viewBox = svg.getAttribute('viewBox').split(' ');
                    const viewBoxX = parseFloat(viewBox[0]);
                    const viewBoxY = parseFloat(viewBox[1]);
                    const viewBoxWidth = parseFloat(viewBox[2]);
                    const viewBoxHeight = parseFloat(viewBox[3]);
                    const svgMouseX = viewBoxX + (touch.clientX - svgRect.left) / svgRect.width * viewBoxWidth;
                    const svgMouseY = viewBoxY + (touch.clientY - svgRect.top) / svgRect.height * viewBoxHeight;

                    // ドロップ位置に最も近いノードを探す
                    let targetNode = null;
                    let minDist = 70;
                    app.networkNodes.forEach(otherNode => {
                        if (otherNode.id !== node.id) {
                            const dist = Math.sqrt(
                                Math.pow(svgMouseX - otherNode.x, 2) +
                                Math.pow(svgMouseY - otherNode.y, 2)
                            );
                            if (dist < minDist) {
                                minDist = dist;
                                targetNode = otherNode;
                            }
                        }
                    });

                    // 接続を作成
                    if (targetNode) {
                        app.createConnection(node.id, targetNode.id);
                        app.redrawDiagram();
                    }

                    // プレビュー線を削除
                    if (app.previewLine && app.previewLine.parentNode) {
                        app.previewLine.parentNode.removeChild(app.previewLine);
                        app.previewLine = null;
                    }

                    // ノードのハイライトをリセット
                    app.networkNodes.forEach(otherNode => {
                        const otherGroup = svg.querySelector(`[data-node-id="${otherNode.id}"]`);
                        if (otherGroup) {
                            const otherCircle = otherGroup.querySelector('circle:first-of-type');
                            if (otherCircle) {
                                otherCircle.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
                                otherCircle.setAttribute('stroke', '#3b82f6');
                            }
                        }
                    });

                    isCreatingConnection = false;
                }

                // プレビュー線があれば削除
                if (app.previewLine && app.previewLine.parentNode) {
                    app.previewLine.parentNode.removeChild(app.previewLine);
                    app.previewLine = null;
                }
            }
        };

        group.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        // クリックイベント（シングルクリックで削除）
        group.addEventListener('click', (e) => {
            if (hasMoved) return; // ドラッグ後のクリックは削除しない
            this.removeNodeFromDiagram(node.id);
        });

        this.svg.appendChild(group);
    }

    setupEventListeners() {
        // ウィンドウリサイズ時にダイアグラムを再描画
        window.addEventListener('resize', () => {
            this.redrawDiagram();
        });

        // ダウンロードボタンのイベントハンドラー
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadDiagramAsImage());
        }

        // SVGへのドラッグ&ドロップ対応
        this.setupDragDropHandlers();
    }

    setupDragDropHandlers() {
        const svg = document.getElementById('networkDiagram');
        if (!svg) return;

        // dragover：ドラッグ中にSVG上にいる時
        svg.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            svg.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        });

        // dragleave：ドラッグがSVGを離れた時
        svg.addEventListener('dragleave', (e) => {
            if (e.target === svg) {
                svg.style.backgroundColor = '';
            }
        });

        // drop：ドロップした時
        svg.addEventListener('drop', (e) => {
            e.preventDefault();
            svg.style.backgroundColor = '';

            // ドロップされたノードタイプ情報を取得
            const nodeTypeJson = e.dataTransfer.getData('nodeType');
            if (!nodeTypeJson) return;

            try {
                const nodeType = JSON.parse(nodeTypeJson);

                // SVGの座標系を取得（viewBox座標に変換）
                const svgRect = svg.getBoundingClientRect();
                const svgElement = svg;

                // ドロップ位置の画面座標
                const screenX = e.clientX - svgRect.left;
                const screenY = e.clientY - svgRect.top;

                // SVGのviewBoxを取得して、画面座標をviewBox座標に変換
                const viewBox = svgElement.getAttribute('viewBox').split(' ');
                const viewBoxX = parseFloat(viewBox[0]);
                const viewBoxY = parseFloat(viewBox[1]);
                const viewBoxWidth = parseFloat(viewBox[2]);
                const viewBoxHeight = parseFloat(viewBox[3]);

                // 変換計算
                const x = viewBoxX + (screenX / svgRect.width) * viewBoxWidth;
                const y = viewBoxY + (screenY / svgRect.height) * viewBoxHeight;

                // ノードを追加（カスタム位置を指定）
                this.addNodeToDiagram(nodeType, x, y);
            } catch (error) {
                console.error('ノード追加エラー:', error);
            }
        });
    }

    downloadDiagramAsImage() {
        const svg = document.getElementById('networkDiagram');
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.textContent;
        downloadBtn.disabled = true;
        downloadBtn.textContent = '処理中...';

        // ダウンロード用のSVGを準備（丸い線を非表示、画像をBase64に変換）
        this.prepareSvgForDownload(svg).then(preparedSvg => {
            // SVGをCanvasに直接描画
            return this.renderSvgToCanvas(preparedSvg);
        }).then(canvas => {
            // PNGとしてダウンロード
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            link.download = `network-diagram-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            downloadBtn.disabled = false;
            downloadBtn.textContent = originalText;
        }).catch(error => {
            console.error('ダウンロードエラー:', error);
            alert('ダウンロードに失敗しました。もう一度試してください。');
            downloadBtn.disabled = false;
            downloadBtn.textContent = originalText;
        });
    }

    prepareSvgForDownload(originalSvg) {
        return new Promise((resolve, reject) => {
            try {
                // SVGをクローン
                const svgClone = originalSvg.cloneNode(true);

                // ノード周囲の円を非表示にする
                const circles = svgClone.querySelectorAll('circle');
                circles.forEach(circle => {
                    circle.style.display = 'none';
                });

                // すべてのimage要素をBase64に変換
                const imageElements = svgClone.querySelectorAll('image');
                let imagesProcessed = 0;

                if (imageElements.length === 0) {
                    resolve(svgClone);
                    return;
                }

                imageElements.forEach(imgElement => {
                    const href = imgElement.getAttribute('href');

                    // 外部画像の場合、Base64に変換
                    if (href && !href.startsWith('data:')) {
                        // 新しいImageオブジェクトで画像を読み込む
                        const img = new Image();
                        img.crossOrigin = 'anonymous';

                        img.onload = () => {
                            try {
                                // 画像をCanvasに描画してBase64に変換
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                const dataUrl = canvas.toDataURL('image/png');

                                imgElement.setAttribute('href', dataUrl);
                                imagesProcessed++;

                                if (imagesProcessed === imageElements.length) {
                                    resolve(svgClone);
                                }
                            } catch (err) {
                                // Canvas変換に失敗した場合は元のhrefのままにする
                                imagesProcessed++;
                                if (imagesProcessed === imageElements.length) {
                                    resolve(svgClone);
                                }
                            }
                        };

                        img.onerror = () => {
                            // 画像読み込み失敗時は元のhrefのままにする
                            imagesProcessed++;
                            if (imagesProcessed === imageElements.length) {
                                resolve(svgClone);
                            }
                        };

                        img.src = href;
                    } else {
                        // すでにData URLの場合
                        imagesProcessed++;
                        if (imagesProcessed === imageElements.length) {
                            resolve(svgClone);
                        }
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    renderSvgToCanvas(svg) {
        return new Promise((resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 1200;
                canvas.height = 900;

                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // SVGを画像に変換
                const svgData = new XMLSerializer().serializeToString(svg);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
                const svgUrl = URL.createObjectURL(svgBlob);

                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(svgUrl);
                    resolve(canvas);
                };
                img.onerror = () => {
                    URL.revokeObjectURL(svgUrl);
                    reject(new Error('SVG描画エラー'));
                };
                img.src = svgUrl;
            } catch (error) {
                reject(error);
            }
        });
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new NetworkApp();
});
