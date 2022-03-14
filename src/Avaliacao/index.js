import React, { Component, Fragment } from 'react';

import { Collapse, Button, Modal, List, Icon } from 'antd';


import Header from '../components/Header'
// import FormGeralAvaliacao from './FormGeralAvaliacao'
import FormPecasAvaliacao from './FormPecasAvaliacao'
// import FormTeoria from './FormTeoria'

import { request, Maybe } from '../utils/data'
import { withAppContext } from '../context';

import { onSave as onSaveRoteiro } from '../Roteiro/utils';
import FormSetar from './FormSetar';
// import FormGeral from './FormGeralAvaliacao'


import FormPecasFisicas from './FormSetar';
import FormMapa from './FormMapa';

// import { withAppContext } from '../context';
// import Header from '../components/Header';

import { onSave as onSaveAnatomp } from '../Avaliacao/utils';
// import FormGeralAvaliacao from './FormGeralAvaliacao';


const Panel = Collapse.Panel;
const Item = List.Item;

const getModelReferenciaRelativa = () => ({
    // _id: uuidv4(),
    referenciaParaReferenciado: '',
    referenciadoParaReferencia: '',
    referencia: null,
})


const _modelPecaFisica = {
    // _id: uuidv4(),
    nome: '',
    descricao: '',
    pecaGenerica: '',
    midias: [],
}

const getModelLocalizacao = () => ({
    // _id: uuidv4(),
    numero: '',
    referenciaRelativa: getModelReferenciaRelativa(),
    pecaFisica: ''
})

const getModelPonto = () => ({
    // _id: uuidv4(),
    label: '',
    parte: null,
    x: '',
    y: '',
})

const _modelMapa = {
    parte: null,
    localizacao: [getModelLocalizacao()],
    pontos: [getModelPonto()]
}


class Avaliacao extends Component {

    state = {
        model: {
            _id: null,
            nome: '',
            idioma: '1',
            curso: '',
            disciplina: '',
            partes: [],
            pecasFisicas: [{ ..._modelPecaFisica }],
            generalidades: [],
            conteudo: {
                selected: [],
            },
        },
        options: {
            listaRoteiros: [],
            listaPecasGenericas: []
        },
        pecas: [],
        pecasFlat: [],
        conteudoExpandido: [],
        somentePratica: false
    }

    componentDidMount() {
        const model = Maybe(this.props.history).bind(h => h.location).bind(l => l.state).maybe(false, s => s.model);
        const { options } = this.state;

        if(model){
            this.setState({
                somentePratica: model.conteudos.length == 0,
                model: {
                    ...model, 
                    idioma: model.idioma._id,
                    partes: [],
                    conteudo: {
                        selected: [],
                        original: [],
                        filtrado: []
                    }
                }                
            })
        }     

        this.onGetData(false)
    }


    componentWillUpdate(nextProps, nextState){
        if((JSON.stringify(this.state.model) != JSON.stringify(nextState.model)) && this.props.onChange){
            this.props.onChange({...nextState.model, somentePratica: nextState.somentePratica})
        }
    }

    componentWillUnmount(){
        this.props.onSetAppState({erros: {campos: [], msgs: []}})
    }    


    render() {
        const {erros, loading} = this.props;
        const { model, pecas, conteudoExpandido, somentePratica } = this.state;
        
        return (
            <div style={{padding: 24}}>
                <h2 className='section' style={{ textAlign: 'center', marginTop: 30 }}>{this.props.match ? 'Elaborar Avaliação' : 'Cadastro de conteúdo do roteiro'}</h2>  
                <div style={{ textAlign: 'right', marginBottom: 5 }}>
                    <Button onClick={() => this.props.onPush('/')} size='small' type='primary' ghost>Voltar para página inicial</Button>
                </div>                
                <Collapse bordered={false} defaultActiveKey={['geral', 'partes']} >
                   {/*  <Panel className='anatome-panel' header={<Header loading={loading} error={this.checkError(['idioma', 'nome', 'curso', 'disciplina'])} contentQ={<p>....</p>} title="Informações gerais da avalição" />} key='geral'>
                        <FormGeralAvaliacao somentePratica={somentePratica} onChangeSomentePratica={this.onChangeSomentePratica} onOpenSnackbar={this.props.onOpenSnackbar} erros={erros} onChange={this.onChange} {...model} />
                    </Panel> */}
                    <Panel className='anatome-panel' header={<Header loading={loading} error={this.checkError(['partes'])} contentQ={<p>....</p>} title="Partes Anatômicas" />} key='partes'>
                        <FormPecasAvaliacao onUpdatePecas={this.onGetData} pecas={pecas} erros={erros} onChange={this.onChange} {...model} />
                    </Panel>
                    <Panel className='anatome-panel' header={<Header loading={loading} error={this.checkError(['pecasFisicas'])} contentQ={<p>...</p>} title="Inclusão das informações das peças anatômicas físicas" />} key='pecaFisica'>
                        <FormSetar
                            {...model}
                            // {...options}
                            isEdit={model.hasOwnProperty('_id')}
                            erros={erros}
                            onChange={this.onChange}
                            onOpenSnackbar={this.props.onOpenSnackbar}
                            onChangeMidia={this.onChangeMidia}
                            onAddPecaFisica={this.onAddPecaFisica}
                            onDeletePecaFisica={this.onDeletePecaFisica}
                            onChangePecaFisica={this.onChangePecaFisica}
                            onBlurPecaFisica={this.onBlurPecaFisica}
                        />
                        <div style={{ textAlign: 'right', marginBottom: 20, marginRight: 16 }}>
                            <Button style={{ marginRight: 5 }} onClick={this.onAddPecaFisica} type='primary' ghost icon='plus'>Peça física</Button>
                        </div>
                    </Panel>
                   {/*  {!somentePratica && <Panel className='anatome-panel' header={<Header loading={loading} error={this.checkError(['conteudo'])} contentQ={<p>....</p>} title="Conhecimento Teórico (CT)" />} key='teoria'>
                        <FormTeoria erros={erros} onChange={this.onChangeConteudoRoteiro} {...model.conteudo} partes={model.partes} conteudoExpandido={conteudoExpandido} />                  
                    </Panel>} */}
                </Collapse>
                {
                    this.props.match && (
                        <div style={{textAlign: 'center'}}>
                            <Button style={{ marginRight: 5 }} icon='rollback' onClick={() => this.props.onPush('/')} size='large'>Voltar</Button>
                            <Button type='primary' icon='check' onClick={this.onSubmit} size='large'>Salvar avaliação</Button>
                        </div>
                    )
                }
            </div>
        )
    }

    /* onChangeSomentePratica = somentePratica => this.setState({somentePratica}, () => {
        if(this.props.onChange){
            this.props.onChange({...this.state.model, somentePratica})            
        }
    }) */

    onSubmit = () => {
        const {somentePratica} = this.state;
        onSaveRoteiro(this.props.onOpenSnackbar, this.props.onSetAppState, {...this.state.model, somentePratica}, ret => {
            this.props.onOpenSnackbar(`O roteiro ${this.state.model.nome} foi salvo com sucesso!`, 'success');            
            this.props.onPush('/')
        })
    }

    onChangeConteudoRoteiro = state => {
        const {model} = this.state;
        this.setState({
            model: {
                ...model,
                conteudo: {
                    ...model.conteudo,
                    ...state
                }
            }
        })
    }
    onGetPecas() {
        const { onOpenSnackbar } = this.props;
        const { options } = this.state;

        request('peca', { method: 'GET' })
            .then(p => {
                if (p.status == 200) {

                    this.setState({
                        options: {
                            ...options,
                            listaPecasGenericas: p.data
                        }
                    })
                } else {
                    throw p.error
                }
            })
            .catch(e => {
                const msg = typeof e === 'string' ? e : 'Falha ao obter os dados da peça';
                onOpenSnackbar(msg)
                console.error(e)
            })
            .finally(() => this.props.onSetAppState({ loading: false }))
    }
    onSelectRoteiro = (partes, model) => {

        const roteiro = this.state.options.listaRoteiros.find(r => r._id == model.roteiro)
        const extra = roteiro ? {
            options: {
                ...this.state.options,
                listaPecasGenericas: roteiro.pecasGenericas
            }
        } : {};


        this.setState({
            model: {
                ...this.state.model,
                ...model,
                mapa: partes.map(p => ({
                    ..._modelMapa,
                    parte: p,
                    localizacao: [{
                        ...getModelLocalizacao(),
                        referenciaRelativa: getModelReferenciaRelativa()
                    }]
                }))
            },
            ...extra
        })
    }

    onChange = field => value => {
        if(field == 'partes' && !this.props.match){
            this.props.onChangePartes(this.state.pecasFlat.filter(p => value.indexOf(p._id) != -1))
        }
        this.setState({ model: { ...this.state.model, [field]: value } })        
    }

    checkError = campos => this.props.erros.campos.find(c => campos.indexOf(c) != -1) != undefined

    onGetData = (isAddPeca = true) => {
        const { onOpenSnackbar, onAddPeca, history } = this.props;
        const model = Maybe(history).bind(h => h.location).bind(l => l.state).maybe(false, s => s.model);        

        if(isAddPeca && onAddPeca){
            this.props.onAddPeca()
        }

        this.props.onSetAppState({loading: true})
        request('peca', { method: 'GET' })
            .then(r => {
                if (r.status == 200) {
                    const conteudoExpandido = [].concat.apply([], r.data.map(p => {
                        return p.conteudoTeorico.map(ct => {
                            const _idsPartes = ct.partes.map(pp => pp._id)
                            const partesOriginais = p.partes.filter(pt => _idsPartes.indexOf(pt._id) != -1);
                            return {...ct, frases: [ct.plural, ct.singular], partesOriginais}
                        })
                    }))

                    const _idsConteudos = model ? model.conteudos.map(c => c._id) : []
                    const _model = model ? {model: {
                        ...model,
                        partes: model.partes.map(p => p._id),
                        idioma: model.idioma._id,
                        conteudo: {
                            selected: conteudoExpandido.filter(c => _idsConteudos.indexOf(c._id) != -1),
                            original: conteudoExpandido,
                            filtrado: conteudoExpandido,
                        }
                    }} : {}
                    this.setState({
                        conteudoExpandido,  
                        ..._model,  
                        pecasFlat: [].concat.apply([], r.data.map(p => p.partes)),                                         
                        pecas: r.data.map(p => ({
                            title: p.nome,
                            value: p._id,
                            key: p._id,
                            children: p.partes.map(pp => ({
                                title: pp.nome,
                                value: pp._id,
                                key: pp._id
                            }))
                        }))
                    })
                } else {
                    throw r.error
                }
            })
            .catch(e => {
                const msg = typeof e === 'string' ? e : 'Falha ao obter os dados da peça';
                onOpenSnackbar(msg)
                console.error(e)
            })
            .finally(() => this.props.onSetAppState({loading: false}))        
    }
   
}

Avaliacao.defaultProps = {
    onAddPeca: false
}

export default withAppContext(Avaliacao)
