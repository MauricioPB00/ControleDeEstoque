import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PainelService } from '../AuthService/painel.service';
import { parseISO, isSaturday, isSunday } from 'date-fns';

interface Registro {
    id: number;
    date: string;
    time: string;
    user_id: string;
    horTrab: string;
    barradeProgresso: string;
}

interface RegistroPorUsuario {
    userId: string;
    registros: Registro[];
    totalHorasTrabalhadas?: string;
}

export function processarRegistros(response: Registro[], toastr: ToastrService, painelService: PainelService) {
    const registrosPorUsuarioMap = new Map<string, Registro[]>();

    response.forEach(registro => {
        const userId = registro.user_id;

        if (!registrosPorUsuarioMap.has(userId)) {
            registrosPorUsuarioMap.set(userId, []);
        }

        registrosPorUsuarioMap.get(userId)!.push(registro);
    });

    registrosPorUsuarioMap.forEach(registros => {
        registros.sort((a, b) => {
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            return 0;
        });
    });

    const registrosOrganizados: RegistroPorUsuario[] = [];

    registrosPorUsuarioMap.forEach((registros, userId) => {
        const registrosPorDiaMap = new Map<string, Registro[]>();

        registros.forEach(registro => {
            const date = registro.date;

            if (!registrosPorDiaMap.has(date)) {
                registrosPorDiaMap.set(date, []);
            }

            registrosPorDiaMap.get(date)!.push(registro);
        });

        const registrosPorDia: RegistroPorUsuario[] = [];

        registrosPorDiaMap.forEach((registros, date) => {
            registrosPorDia.push({ userId, registros });
        });

        registrosOrganizados.push(...registrosPorDia);
    });

    registrosOrganizados.sort((a, b) => {
        if (a.registros[0].date < b.registros[0].date) return -1;
        if (a.registros[0].date > b.registros[0].date) return 1;
        return 0;
    });

    registrosOrganizados.forEach(registrosPorUsuario => {
        let totalMilissegundos = 0;

        registrosPorUsuario.registros.sort((a, b) => {
            const horaA = new Date('1970-01-01T' + a.time).getTime();
            const horaB = new Date('1970-01-01T' + b.time).getTime();
            return horaA - horaB;
        });

        const registros = registrosPorUsuario.registros;

        if (registros.length % 2 !== 0) {
            console.error('Número ímpar de registros para o usuário', registrosPorUsuario.userId);
            return;
        }

        for (let i = 0; i < registros.length; i += 2) {
            const horaEntrada = new Date('1970-01-01T' + registros[i].time).getTime();
            const horaSaida = new Date('1970-01-01T' + registros[i + 1].time).getTime();
            
            totalMilissegundos += Math.abs(horaSaida - horaEntrada);
        }
        const horas = Math.floor(totalMilissegundos / (1000 * 60 * 60));
        const minutos = Math.floor((totalMilissegundos % (1000 * 60 * 60)) / (1000 * 60));
        registrosPorUsuario.totalHorasTrabalhadas = `${horas}:${minutos < 10 ? '0' : ''}${minutos}`;
        const date = registros[0].date;
        const usuario = registrosPorUsuario.userId;
        const hora = registrosPorUsuario.totalHorasTrabalhadas;

        verificaFinalSemana(date, usuario, hora, toastr, painelService);
    });
    toastr.success('Usuários atualizados');
}

function verificaFinalSemana(date: string, usuario: string, hora: string, toastr: ToastrService, painelService: PainelService) {
    const dateToCheck = parseISO(date);
    let weekend = '1';
    if (isSaturday(dateToCheck)) {
        weekend = '2';
    } else if (isSunday(dateToCheck)) {
        weekend = '3';
    }
    salvarHoraCalculada(date, usuario, hora, weekend, toastr, painelService);
}

function salvarHoraCalculada(date: any, usuario: any, hora: any, weekend: any, toastr: ToastrService, painelService: PainelService) {
    painelService.postHorasCalculadas(date, usuario, hora, weekend).subscribe(
        (data) => {
            console.log(data);
        },
        (error) => {
            toastr.error('Erro ao salvar');
        }
    );
}