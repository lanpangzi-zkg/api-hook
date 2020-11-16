import React from 'react';

class Menu extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            menuList: [],
        };
        this.fetchMenuList = this.fetchMenuList.bind(this);
    }
    fetchMenuList() {
        var request = new XMLHttpRequest();
        request.open('GET', 'http://127.0.0.1:4000/info');
        request.responseType = 'json';

        request.onload = () => {
            if (request.status === 200) {
                this.setState({
                    menuList: request.response.data || [],
                });
            }
        };
        request.send();
    }
    render() {
        const { menuList } = this.state;
        return (
            <div
                style={{
                    textAlign: 'left',
                    position: 'absolute',
                    top: '0px',
                }}
            >
                <button onClick={this.fetchMenuList}>请求列表</button>
                <ul>
                    {
                        menuList.map((item, i) => {
                            return (
                                <li key={`${i}`}>{item}</li>
                            );
                        })
                    }
                </ul>
            </div>
        );
    }
}

export default Menu;